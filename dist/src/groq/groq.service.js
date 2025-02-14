"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqCreateSummaryAnthropometry = exports.groqCreateSummary = exports.groqService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const antropomerty_model_1 = require("../anthropometry/antropomerty.model");
const user_model_1 = require("../user/user.model");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
exports.groqService = {
    getGroqResponse(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield groq.chat.completions.create({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
            });
            return response;
        });
    },
};
const groqCreateSummary = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield groq.chat.completions.create({
            model: "deepseek-r1-distill-llama-70b",
            messages: [{ role: "user", content: prompt }],
        });
        const summary = response.choices[0].message.content;
        return summary;
    }
    catch (error) {
        console.log(error);
        return "Error";
    }
});
exports.groqCreateSummary = groqCreateSummary;
function removeThinkTag(content) {
    return content.replace(/<think>[\s\S]*?<\/think>/g, "");
}
const groqCreateSummaryAnthropometry = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = antropomerty_model_1.anthropometryModel.search("userId", "==", userId);
    const userData = user_model_1.userModel.search("id", "==", userId);
    // di dalam data ada date gunakan 10 data terakhir
    const last10Data = data.slice(-10);
    const status = {
        underweight: "Kekurangan berat badan",
        normal: "Berat badan normal",
        overweight: "Kelebihan berat badan",
        obesity: "Obesitas",
    };
    // Set status berdasarkan BMI
    const statusBmi = (bmi) => {
        if (bmi < 18.5)
            return "underweight";
        if (bmi >= 18.5 && bmi < 24.9)
            return "normal";
        if (bmi >= 25 && bmi < 29.9)
            return "overweight";
        if (bmi >= 30)
            return "obesity";
    };
    let prompt = "Kamu adalah asisten kesehatan berbasis AI yang ahli dalam menganalisis indeks massa tubuh (BMI) dan memberikan saran kesehatan yang sesuai. Berikut adalah data pengguna: ";
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
    prompt += `
  Perhatikan tata cara penulisan respon berikut ini:
  - Gunakan Bahasa Indonesia dalam memberikan resposne
  - Berikan response yang singkat saja
  - Berikan response sebagai markdown yang rapi
  `;
    let summary = yield (0, exports.groqCreateSummary)(prompt);
    summary = removeThinkTag(summary);
    return summary;
});
exports.groqCreateSummaryAnthropometry = groqCreateSummaryAnthropometry;
