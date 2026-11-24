import { VoiceOption } from '../types';

export const VOICES: VoiceOption[] = [
  {
    id: 'Puck',
    name: 'Ustadz Hanafi',
    gender: 'Pria',
    description: 'Suara wibawa, hangat, dan artikulasi makhraj huruf Arab sangat fasih.',
    tone: 'Tausiyah & Khutbah Santun',
    badge: 'Paling Populer',
  },
  {
    id: 'Kore',
    name: 'Ustadzah Sarah',
    gender: 'Wanita',
    description: 'Suara teduh, anggun, artikulasi tajwid tartil dan intonasi lembut.',
    tone: 'Doa & Nasihat Teduh',
    badge: 'Suara Wanita Faktual',
  },
  {
    id: 'Charon',
    name: 'Khatib Salman',
    gender: 'Pria',
    description: 'Suara dalam, berkarakter tegas dan bersemangat untuk khutbah dan pesan motivasi.',
    tone: 'Khutbah & Sambutan Majelis',
    badge: 'Berkarakter Mantap',
  },
  {
    id: 'Zephyr',
    name: 'Ustadz Zephyr (Tartil)',
    gender: 'Wanita',
    description: 'Tempo tenang teratur, artikulasi sangat bersih cocok untuk hafalan dan doa.',
    tone: 'Kajian & Bacaan Doa',
    badge: 'Jernih & Khusyuk',
  },
  {
    id: 'Fenrir',
    name: 'Kang Farhan (Ikhwan)',
    gender: 'Pria',
    description: 'Suara natural santai khas percakapan sehari-hari bernuansa Islami/Arab.',
    tone: 'Percakapan Santai Arab-Indo',
    badge: 'Natural & Gaul Santun',
  },
];

export const TTS_PRESETS = [
  {
    title: 'Khutbah & Tausiyah Singkat',
    category: 'Tausiyah',
    text: "Alhamdulillahi rabbil 'alamin, wash-shalatu was-salamu 'ala asyrafil anbiya'i wal mursalin. Segala puji bagi Allah Subhanahu wa Ta'ala yang telah melimpahkan rahmat, taufik, dan kesehatan kepada kita semua. Marilah kita senantiasa meningkatkan ketakwaan dan memperbanyak amal shalih di setiap hembusan nafas kita.",
  },
  {
    title: 'Doa Pembuka Majelis & Keberkahan',
    category: 'Doa',
    text: "Bismillaahir-rahmaanir-rahiim. Allahumma inni as-aluka 'ilman naafi'an, wa rizqan thayyiban, wa 'amalan mutaqabbalan. Ya Allah, berkahilah perkumpulan kami hari ini, jadikanlah setiap langkah ikhtiar kami bernilai ibadah dan mendatangkan maslahat bagi sesama.",
  },
  {
    title: 'Percakapan Hangat Sehari-hari',
    category: 'Percakapan',
    text: "Assalamu'alaikum akhi, kaifa haluk hari ini? Alhamdulillah, semoga antum dan keluarga senantiasa berada dalam lindungan dan keberkahan Allah Ta'ala. Jangan lupa insya Allah nanti sore kita selesaikan tugas bersama ya, syukran katsiran atas bantuannya.",
  },
  {
    title: 'Doa Memohon Kemudahan Urusan',
    category: 'Doa',
    text: "Rabbisyrah lii shadrii, wa yassir lii amrii, wahlul 'uqdatan min lisaanii yafqahuu qawlii. Ya Allah, lapangkanlah dadaku, mudahkanlah segala urusanku, dan bimbinglah lisanku agar menyampaikan kebaikan dengan fasih dan penuh hikmah.",
  },
  {
    title: 'Ucapan Tahniah & Doa Idul Fitri',
    category: 'Ucapan',
    text: "Taqabbalallahu minna wa minkum shiyamana wa shiyamakum. Kullu 'amin wa antum bi khair. Mohon maaf lahir dan batin atas segala khilaf kata dan perbuatan. Semoga Allah Subhanahu wa Ta'ala melimpahkan ridha dan ketenangan dalam hidup kita.",
  },
];

export const QUICK_ARABIC_PHRASES = [
  { label: '﷽ Bismillah', text: 'Bismillaahir-rahmaanir-rahiim' },
  { label: 'Assalamu\'alaikum', text: "Assalamu'alaikum warahmatullahi wabarakatuh" },
  { label: 'Alhamdulillah', text: "Alhamdulillahi rabbil 'alamin" },
  { label: 'InsyaAllah', text: "Insya Allah Ta'ala" },
  { label: 'Subhanallah', text: 'Subhanallah' },
  { label: 'Jazakallahu Khairan', text: 'Jazakallahu khairan katsiran' },
  { label: 'Barakallahu Fiik', text: 'Barakallahu fiikum' },
  { label: 'Astaghfirullah', text: "Astaghfirullahal 'adzim" },
  { label: 'MasyaAllah', text: 'MasyaAllah tabarakallah' },
  { label: 'La Hawla...', text: 'La hawla wa la quwwata illa billah' },
  { label: 'Afwan (Maaf)', text: 'Afwan' },
  { label: 'Kaifa Haluk?', text: 'Kaifa haluk?' },
];

export const ARABIC_INDO_DICTIONARY = [
  {
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
    transliteration: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    meaning: 'Semoga kedamaian, rahmat Allah, dan berkah-Nya tercurah kepadamu',
    category: 'Salam & Sapaan',
    usage: 'Diucapkan saat bertemu, membuka pidato, surat, atau percakapan',
  },
  {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: "Bismillaahir-rahmaanir-rahiim",
    meaning: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang',
    category: 'Doa Pembuka',
    usage: 'Diucapkan sebelum memulai aktivitas kebaikan atau pekerjaan penting',
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Alhamdulillahi Rabbil 'Alamin",
    meaning: 'Segala puji bagi Allah, Tuhan seluruh alam',
    category: 'Tahmid & Syukur',
    usage: 'Diucapkan saat mendapatkan nikmat, selesai makan, atau menyelesaikan urusan',
  },
  {
    arabic: 'إِنْ شَاءَ اللَّهُ تَعَالَى',
    transliteration: "Insya Allah Ta'ala",
    meaning: 'Jika Allah menghendaki',
    category: 'Pernyataan Niat',
    usage: 'Diucapkan ketika berjanji atau merencanakan sesuatu di masa depan',
  },
  {
    arabic: 'جَزَاكَ اللَّهُ خَيْرًا كَثِيرًا',
    transliteration: 'Jazakallahu Khairan Katsiran',
    meaning: 'Semoga Allah membalasmu dengan kebaikan yang banyak',
    category: 'Ucapan Terima Kasih',
    usage: 'Ungkapan terima kasih mendalam kepada orang yang telah berbuat baik',
  },
  {
    arabic: 'بَارَكَ اللَّهُ فِيكُمْ',
    transliteration: 'Barakallahu Fiikum',
    meaning: 'Semoga Allah memberkahi kalian',
    category: 'Doa Keberkahan',
    usage: 'Didoakan kepada sesama atas kebaikan, pernikahan, atau pencapaian',
  },
  {
    arabic: 'مَا شَاءَ اللَّهُ تَبَارَكَ اللَّهُ',
    transliteration: 'MasyaAllah Tabarakallah',
    meaning: 'Apa yang dikehendaki Allah, Mahasuci Allah Maha Penuh Berkah',
    category: 'Kekaguman',
    usage: 'Diucapkan saat melihat hal menakjubkan, keindahan, anak lucu, atau prestasi',
  },
  {
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ',
    transliteration: "Astaghfirullahal 'Adzim",
    meaning: 'Aku memohon ampun kepada Allah Yang Maha Agung',
    category: 'Istighfar & Taubat',
    usage: 'Diucapkan ketika berbuat khilaf, terkejut melihat hal buruk, atau berdzikir',
  },
  {
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La Hawla Wa La Quwwata Illa Billah',
    meaning: 'Tidak ada daya dan upaya kecuali dengan pertolongan Allah',
    category: 'Tawakal',
    usage: 'Diucapkan saat menghadapi kesulitan atau merasa tidak berdaya',
  },
  {
    arabic: 'أَهْلًا وَسَهْلًا',
    transliteration: 'Ahlan wa Sahlan',
    meaning: 'Selamat datang',
    category: 'Salam & Sapaan',
    usage: 'Menyambut tamu atau sahabat yang baru tiba',
  },
];
