import Groq from "groq-sdk";
import dotenv from "dotenv";
import { anthropometryModel } from "../anthropometry/antropomerty.model";
import { userModel } from "../user/user.model";
import { jsonResponseFormat } from "./groq.promnt";
import {
  calculateAge,
  calculateHeightStatus,
  calculateKMSStatus,
  calculateWeightForHeightStatus,
} from "../utils";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const groqService = {
  async getGroqResponse(prompt: string) {
    const response = await groq.chat.completions.create({
      model: "qwen-2.5-32b",
      messages: [
        {
          role: "system",
          content:
            "use indonesia, and use markdown format, dont give (AI:, Percakapan AI:)",
        },
        { role: "user", content: prompt },
      ],
    });
    return response.choices[0].message.content;
  },
};

export const groqCreateSummaryKMS = async (userId: string) => {
  try {
    const data = await anthropometryModel.search("userId", "==", userId);
    const userData = await userModel.search("id", "==", userId);

    // Get the 10 most recent data points
    const last10Data = data.slice(-10);

    // For children under 5 years old, use KMS status
    const birthDate = new Date(userData[0].tgl_lahir);
    const ageData = calculateAge(birthDate);
    const gender = userData[0].jk ? "male" : "female";

    // Define KMS status descriptions
    const weightStatus = {
      "Severely Underweight": "Berat badan sangat kurang",
      Underweight: "Berat badan kurang",
      Normal: "Berat badan normal",
      Overweight: "Berat badan lebih",
    };

    const heightStatus = {
      "Severely Stunted": "Sangat pendek (severely stunted)",
      Stunted: "Pendek (stunted)",
      Normal: "Tinggi badan normal",
      Tall: "Tinggi",
    };

    // For weight-for-height (WFH) status
    const wfhStatus = {
      "Severely Wasted": "Sangat kurus (severely wasted)",
      Wasted: "Kurus (wasted)",
      Normal: "Normal",
      Overweight: "Gemuk",
    };

    let prompt =
      "Kamu adalah asisten kesehatan berbasis AI yang ahli dalam menganalisis data kesehatan anak di bawah 5 tahun menggunakan standar KMS (Kartu Menuju Sehat). " +
      "Berikan saran kesehatan yang tepat untuk anak ini berdasarkan data pertumbuhan. Berikut adalah data pengguna: \n\n";

    prompt += `Tanggal Lahir: ${userData[0].tgl_lahir}\n`;
    prompt += `Usia: ${ageData.age} tahun ${ageData.months} bulan\n`;
    prompt += `Jenis Kelamin: ${userData[0].jk ? "Laki-Laki" : "Perempuan"}\n`;
    prompt += `Hari Sekarang: ${new Date().toString()}\n\n`;

    prompt += "Data pertumbuhan terakhir:\n\n";

    for (let d of last10Data) {
      // Get or calculate KMS statuses
      const weightForAgeStatus =
        (d.ksm as keyof typeof weightStatus) ||
        calculateKMSStatus(
          ageData.age * 12 + ageData.months,
          Number(d.weight),
          gender
        );

      // Calculate height status if not already in the data
      const heightForAgeStatus: keyof typeof heightStatus =
        (d.kms_tb as keyof typeof heightStatus) ||
        (calculateHeightStatus(
          ageData.age * 12 + ageData.months,
          Number(d.height),
          gender
        ) as keyof typeof heightStatus);

      // Calculate weight-for-height status
      const weightForHeightStatus = calculateWeightForHeightStatus(
        Number(d.height),
        Number(d.weight),
        gender
      );

      prompt += `Tanggal: ${d.date}\n`;
      prompt += `Tinggi badan: ${d.height} cm\n`;
      prompt += `Berat badan: ${d.weight} kg\n`;
      prompt += `Status BB/U (Weight-for-Age): ${
        weightStatus[weightForAgeStatus] || weightForAgeStatus
      }\n`;
      prompt += `Status TB/U (Height-for-Age): ${
        heightStatus[heightForAgeStatus] || heightForAgeStatus
      }\n`;
      prompt += `Status BB/TB (Weight-for-Height): ${
        wfhStatus[weightForHeightStatus as keyof typeof wfhStatus] ||
        weightForHeightStatus
      }\n\n`;
    }

    prompt +=
      "Berikan analisis mengenai pertumbuhan anak ini dengan memperhatikan tiga indikator utama: " +
      "BB/U (berat badan menurut umur), TB/U (tinggi badan menurut umur), dan BB/TB (berat badan menurut tinggi badan). " +
      "Jelaskan apa arti dari status pertumbuhan terakhir dan tren pertumbuhan selama periode pengukuran. " +
      "Berikan saran konkret untuk orang tua tentang cara meningkatkan atau mempertahankan pertumbuhan anak yang optimal. " +
      "Gunakan bahasa yang mudah dipahami dan berikan contoh menu makanan jika relevan.\n\n" +
      "Gunakan Bahasa Indonesia dalam memberikan response.";

    let summary = await groqCreateSummary(prompt);
    summary = removeThinkTag(summary as string);

    return summary;
  } catch (error) {
    console.log(error);
    return JSON.stringify({
      error: "Terjadi kesalahan saat menganalisis data pertumbuhan anak.",
      message: "Silakan coba lagi nanti atau hubungi dukungan teknis.",
    });
  }
};

export const groqCreateSummary = async (prompt: string) => {
  try {
    const response = await groq.chat.completions.create({
      model: "qwen-2.5-32b",
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
  const data = await anthropometryModel.search("userId", "==", userId);
  const userData = await userModel.search("id", "==", userId);

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
