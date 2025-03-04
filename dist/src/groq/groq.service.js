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
exports.groqCreateSummaryAnthropometry = exports.groqCreateSummary = exports.groqCreateSummaryKMS = exports.groqService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const antropomerty_model_1 = require("../anthropometry/antropomerty.model");
const user_model_1 = require("../user/user.model");
const groq_promnt_1 = require("./groq.promnt");
const utils_1 = require("../utils");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
exports.groqService = {
    getGroqResponse(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield groq.chat.completions.create({
                model: "qwen-2.5-32b",
                messages: [
                    {
                        role: "system",
                        content: "use indonesia, and use markdown format, dont give (AI:, Percakapan AI:)",
                    },
                    { role: "user", content: prompt },
                ],
            });
            return response.choices[0].message.content;
        });
    },
};
const groqCreateSummaryKMS = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = antropomerty_model_1.anthropometryModel.search("userId", "==", userId);
        const userData = user_model_1.userModel.search("id", "==", userId);
        // Get the 10 most recent data points
        const last10Data = data.slice(-10);
        // For children under 5 years old, use KMS status
        const birthDate = new Date(userData[0].tgl_lahir);
        const ageData = (0, utils_1.calculateAge)(birthDate);
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
        let prompt = "Kamu adalah asisten kesehatan berbasis AI yang ahli dalam menganalisis data kesehatan anak di bawah 5 tahun menggunakan standar KMS (Kartu Menuju Sehat). " +
            "Berikan saran kesehatan yang tepat untuk anak ini berdasarkan data pertumbuhan. Berikut adalah data pengguna: \n\n";
        prompt += `Tanggal Lahir: ${userData[0].tgl_lahir}\n`;
        prompt += `Usia: ${ageData.age} tahun ${ageData.months} bulan\n`;
        prompt += `Jenis Kelamin: ${userData[0].jk ? "Laki-Laki" : "Perempuan"}\n`;
        prompt += `Hari Sekarang: ${new Date().toString()}\n\n`;
        prompt += "Data pertumbuhan terakhir:\n\n";
        for (let d of last10Data) {
            // Get or calculate KMS statuses
            const weightForAgeStatus = d.ksm ||
                (0, utils_1.calculateKMSStatus)(ageData.age * 12 + ageData.months, Number(d.weight), gender);
            // Calculate height status if not already in the data
            const heightForAgeStatus = d.kms_tb ||
                (0, utils_1.calculateHeightStatus)(ageData.age * 12 + ageData.months, Number(d.height), gender);
            // Calculate weight-for-height status
            const weightForHeightStatus = (0, utils_1.calculateWeightForHeightStatus)(Number(d.height), Number(d.weight), gender);
            prompt += `Tanggal: ${d.date}\n`;
            prompt += `Tinggi badan: ${d.height} cm\n`;
            prompt += `Berat badan: ${d.weight} kg\n`;
            prompt += `Status BB/U (Weight-for-Age): ${weightStatus[weightForAgeStatus] || weightForAgeStatus}\n`;
            prompt += `Status TB/U (Height-for-Age): ${heightStatus[heightForAgeStatus] || heightForAgeStatus}\n`;
            prompt += `Status BB/TB (Weight-for-Height): ${wfhStatus[weightForHeightStatus] ||
                weightForHeightStatus}\n\n`;
        }
        prompt +=
            "Berikan analisis mengenai pertumbuhan anak ini dengan memperhatikan tiga indikator utama: " +
                "BB/U (berat badan menurut umur), TB/U (tinggi badan menurut umur), dan BB/TB (berat badan menurut tinggi badan). " +
                "Jelaskan apa arti dari status pertumbuhan terakhir dan tren pertumbuhan selama periode pengukuran. " +
                "Berikan saran konkret untuk orang tua tentang cara meningkatkan atau mempertahankan pertumbuhan anak yang optimal. " +
                "Gunakan bahasa yang mudah dipahami dan berikan contoh menu makanan jika relevan.\n\n" +
                "Gunakan Bahasa Indonesia dalam memberikan response.";
        let summary = yield (0, exports.groqCreateSummary)(prompt);
        summary = removeThinkTag(summary);
        return summary;
    }
    catch (error) {
        console.log(error);
        return JSON.stringify({
            error: "Terjadi kesalahan saat menganalisis data pertumbuhan anak.",
            message: "Silakan coba lagi nanti atau hubungi dukungan teknis.",
        });
    }
});
exports.groqCreateSummaryKMS = groqCreateSummaryKMS;
const groqCreateSummary = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield groq.chat.completions.create({
            model: "qwen-2.5-32b",
            messages: [
                { role: "system", content: groq_promnt_1.jsonResponseFormat },
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
    let prompt = "Kamu adalah asisten kesehatan berbasis AI yang ahli dalam menganalisis indeks massa tubuh (BMI) dan memberikan saran kesehatan yang sesuai. Berikut adalah data pengguna: \n\n";
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
    let summary = yield (0, exports.groqCreateSummary)(prompt);
    summary = removeThinkTag(summary);
    return summary;
});
exports.groqCreateSummaryAnthropometry = groqCreateSummaryAnthropometry;
