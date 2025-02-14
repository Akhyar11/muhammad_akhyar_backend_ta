import Groq from "groq-sdk";
import dotenv from "dotenv";
import { anthropometryModel } from "../anthropometry/antropomerty.model";
import { userModel } from "../user/user.model";
import { jsonResponseFormat } from "./groq.promnt";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const groqService = {
  async getGroqResponse(prompt: string) {
    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
    });
    return response;
  },
};

export const groqCreateSummary = async (prompt: string) => {
  try {
    const response = await groq.chat.completions.create({
      model: "deepseek-r1-distill-llama-70b",
      messages: [
        { role: "system", content: jsonResponseFormat },
        { role: "user", content: prompt },
      ],
      temperature: 1,
      max_completion_tokens: 4700,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const summary = response.choices[0].message.content;
    return summary;
  } catch (error) {
    console.log(error);
    return "Error";
  }
};

function removeThinkTag(content: string) {
  return content.replace(/<think>[\s\S]*?<\/think>/g, "");
}

export const groqCreateSummaryAnthropometry = async (userId: string) => {
  const data = anthropometryModel.search("userId", "==", userId);
  const userData = userModel.search("id", "==", userId);

  // di dalam data ada date gunakan 10 data terakhir
  const last10Data = data.slice(-10);

  const status = {
    underweight: "Kekurangan berat badan",
    normal: "Berat badan normal",
    overweight: "Kelebihan berat badan",
    obesity: "Obesitas",
  };

  // Set status berdasarkan BMI
  const statusBmi = (bmi: number) => {
    if (bmi < 18.5) return "underweight";
    if (bmi >= 18.5 && bmi < 24.9) return "normal";
    if (bmi >= 25 && bmi < 29.9) return "overweight";
    if (bmi >= 30) return "obesity";
  };

  let prompt =
    "Kamu adalah asisten kesehatan berbasis AI yang ahli dalam menganalisis indeks massa tubuh (BMI) dan memberikan saran kesehatan yang sesuai. Berikut adalah data pengguna: \n\n";

  prompt += `Tanggal Lahir: ${userData[0].tgl_lahir}\n`;
  prompt += `Jenis Kelamin: ${userData[0].jk ? "Laki-Laki" : "Perempuan"}\n`;
  prompt += `Hari Sekarang: ${new Date().toString()}\n\n`;

  for (let d of last10Data) {
    prompt += `Tanggal: ${d.date}\n`;
    prompt += `Tinggi badan: ${d.height} cm\n`;
    prompt += `Berat badan: ${d.weight} kg\n`;
    prompt += `BMI: ${d.bmi}\n\n`;
    prompt += `Status: ${status[statusBmi(Number(d.bmi)) || "normal"]}\n\n`;
  }
  prompt += `Gunakan Bahasa Indonesia dalam memberikan resposne`;

  let summary = await groqCreateSummary(prompt);
  summary = removeThinkTag(summary as string);

  return summary;
};
