import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Apakah Nusa Lingua gratis?",
    a: "Ya. Semua lesson, kamus, artikel budaya, dan fitur komunitas bisa dipakai gratis setelah membuat akun.",
  },
  {
    q: "Bahasa daerah apa saja yang tersedia?",
    a: "Daftar bahasa terus bertambah. Lihat bagian Peta Bahasa di halaman ini untuk bahasa yang sudah aktif beserta daerah asalnya.",
  },
  {
    q: "Apakah saya perlu login?",
    a: "Halaman ini bisa dibaca tanpa akun, dan kamu bisa mencoba satu soal di atas. Untuk belajar, membuka kamus, membaca artikel, ngobrol dengan asisten AI, dan menyimpan progres, kamu perlu masuk.",
  },
  {
    q: "Apa itu tingkat tutur (ngoko, krama, dll.)?",
    a: "Beberapa bahasa daerah memiliki ragam bahasa yang berbeda tergantung lawan bicara. Kamus kami menandai tingkat tutur setiap kata supaya kamu tahu kapan memakainya.",
  },
  {
    q: "Bagaimana cara berkontribusi?",
    a: "Buka menu Kontribusi, usulkan kata beserta artinya, dan rekam pelafalanmu. Moderator meninjau setiap usulan sebelum masuk ke kamus.",
  },
  {
    q: "Apakah jawaban asisten AI selalu benar?",
    a: "Asisten AI bisa keliru, terutama untuk ungkapan yang sangat lokal. Gunakan sebagai teman latihan dan cek kembali dengan kamus atau penutur asli.",
  },
];

export function Faq() {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {FAQ.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
