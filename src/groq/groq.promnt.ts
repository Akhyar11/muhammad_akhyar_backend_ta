export const jsonResponseFormat = `
Pastikan menggunakan json format ini
{
  "summary": "Ringkasan kondisi kesehatan berdasarkan analisis data.",
  "important_info": [
    "Poin-poin utama terkait kondisi kesehatan.",
    "Faktor risiko atau hal yang perlu diperhatikan."
  ],
  "health_advice": {
    "message": "Pesan utama tentang kondisi kesehatan pengguna.",
    "recommendations": [
      "Saran spesifik yang dapat dilakukan untuk meningkatkan kesehatan.",
      "Bisa berupa pola makan, olahraga, atau konsultasi dengan tenaga medis."
    ],
    "urgency_level": "low | moderate | high | critical",
    "risk_factors": [
      "Faktor risiko yang mempengaruhi kondisi kesehatan.",
      "Bisa terkait dengan gaya hidup, pola makan, atau riwayat medis."
    ]
  },
}
`;
