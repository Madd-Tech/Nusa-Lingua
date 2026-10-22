import type { Enums } from "@/types/database";

type PersonaAddress = { address_male: string | null; address_female: string | null };

/**
 * Instruksi cara persona memanggil pengguna sesuai jenis kelaminnya. Ditambahkan ke
 * system_prompt di /api/chat. Panggilan per persona ada di ai_personas.address_male /
 * address_female (migrasi 0009); NULL = belum ada data, jadi persona memakai sapaan netral.
 */
export function addressInstruction(gender: Enums<"user_gender"> | null, persona: PersonaAddress) {
  if (!gender) {
    return `
TENTANG PENGGUNA:
Jenis kelamin pengguna belum diketahui. Jangan menebaknya: pakai sapaan netral dan hindari panggilan yang khusus laki-laki atau perempuan.`.trim();
  }

  const address = gender === "male" ? persona.address_male : persona.address_female;
  return [
    "TENTANG PENGGUNA:",
    `Pengguna adalah ${gender === "male" ? "laki-laki" : "perempuan"}.`,
    address
      ? `Panggil pengguna dengan sapaan ini: ${address}`
      : "Belum ada data panggilan khusus untuk jenis kelamin ini dalam bahasamu: pakai sapaan netral dan jangan mengarang panggilan baru.",
    "Pilih satu panggilan yang paling cocok dan pakai secara konsisten, tetapi wajar (tidak di setiap kalimat). Di terjemahan bahasa Indonesia, panggilan daerah boleh tetap ditulis dalam bentuk aslinya.",
  ].join("\n");
}
