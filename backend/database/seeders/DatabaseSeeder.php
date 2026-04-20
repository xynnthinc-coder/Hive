<?php

namespace Database\Seeders;

use App\Models\ChatChannel;
use App\Models\ClassMember;
use App\Models\ClassRoom;
use App\Models\ForumChannel;
use App\Models\Message;
use App\Models\Reply;
use App\Models\School;
use App\Models\Thread;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic sample data.
     *
     * Scenario: SMKN 1 Bandung, with class XII RPL 1.
     * - 1 Teacher (Pak Budi)
     * - 1 Moderator / Ketua Kelas (Andi)
     * - 3 Students (Budi, Citra, Dimas)
     * - Forum channels with threads and replies
     * - Chat channels with messages
     */
    public function run(): void
    {
        // ─── 1. Create School ────────────────────────────
        $school = School::create([
            'name' => 'SMKN 1 Bandung',
            'description' => 'Sekolah Menengah Kejuruan Negeri 1 Bandung — Jurusan RPL, TKJ, MM',
            'invite_code' => 'SMKN1BDG',
        ]);

        // ─── 2. Create Users ─────────────────────────────
        $teacher = User::create([
            'name' => 'Budi Santoso',
            'nickname' => 'Pak Budi',
            'email' => 'budi.santoso@smkn1.sch.id',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'school_id' => $school->id,
            'bio' => 'Guru mata pelajaran Pemrograman Web & Mobile. 10 tahun pengalaman mengajar.',
        ]);

        $ketuaKelas = User::create([
            'name' => 'Andi Pratama',
            'nickname' => 'Andi',
            'email' => 'andi@student.smkn1.sch.id',
            'password' => Hash::make('password'),
            'role' => 'student',
            'school_id' => $school->id,
            'bio' => 'Ketua kelas XII RPL 1. Suka backend development.',
        ]);

        $studentB = User::create([
            'name' => 'Budi Raharjo',
            'nickname' => 'Budi',
            'email' => 'budi.r@student.smkn1.sch.id',
            'password' => Hash::make('password'),
            'role' => 'student',
            'school_id' => $school->id,
            'bio' => 'Full-stack enthusiast. Laravel + React.',
        ]);

        $studentC = User::create([
            'name' => 'Citra Dewi',
            'nickname' => 'Citra',
            'email' => 'citra@student.smkn1.sch.id',
            'password' => Hash::make('password'),
            'role' => 'student',
            'school_id' => $school->id,
            'bio' => 'UI/UX designer & frontend developer.',
        ]);

        $studentD = User::create([
            'name' => 'Dimas Aditya',
            'nickname' => 'Dimas',
            'email' => 'dimas@student.smkn1.sch.id',
            'password' => Hash::make('password'),
            'role' => 'student',
            'school_id' => $school->id,
            'bio' => 'Backend developer. Suka ngulik Docker & Linux.',
        ]);

        // ─── 3. Create Class ─────────────────────────────
        $classXII = ClassRoom::create([
            'school_id' => $school->id,
            'name' => 'XII RPL 1',
            'description' => 'Kelas XII Rekayasa Perangkat Lunak 1 — Tahun Ajaran 2025/2026',
            'academic_year' => '2025/2026',
            'invite_code' => 'XIIRPL1',
            'created_by' => $teacher->id,
        ]);

        // ─── 4. Add Members to Class ─────────────────────
        ClassMember::create([
            'class_id' => $classXII->id,
            'user_id' => $teacher->id,
            'role' => 'teacher',
        ]);

        ClassMember::create([
            'class_id' => $classXII->id,
            'user_id' => $ketuaKelas->id,
            'role' => 'moderator', // Ketua kelas = moderator
        ]);

        ClassMember::create([
            'class_id' => $classXII->id,
            'user_id' => $studentB->id,
            'role' => 'member',
        ]);

        ClassMember::create([
            'class_id' => $classXII->id,
            'user_id' => $studentC->id,
            'role' => 'member',
        ]);

        ClassMember::create([
            'class_id' => $classXII->id,
            'user_id' => $studentD->id,
            'role' => 'member',
        ]);

        // ─── 5. Create Forum Channels ────────────────────
        $forumGeneral = ForumChannel::create([
            'class_id' => $classXII->id,
            'name' => 'General',
            'description' => 'Diskusi umum seputar kelas dan pelajaran',
            'icon' => '💬',
            'created_by' => $teacher->id,
        ]);

        $forumLaravel = ForumChannel::create([
            'class_id' => $classXII->id,
            'name' => 'TugasAkhir-Laravel',
            'description' => 'Forum diskusi tugas akhir menggunakan Laravel',
            'icon' => '🔥',
            'created_by' => $teacher->id,
        ]);

        $forumBugReport = ForumChannel::create([
            'class_id' => $classXII->id,
            'name' => 'Bug Report',
            'description' => 'Tempat nanya soal error dan bugs',
            'icon' => '🐛',
            'created_by' => $ketuaKelas->id,
        ]);

        // ─── 6. Create Threads & Replies ─────────────────

        // Thread 1: Error koneksi database (The use case scenario!)
        $thread1 = Thread::create([
            'forum_channel_id' => $forumLaravel->id,
            'user_id' => $ketuaKelas->id,
            'title' => 'Error koneksi database saat migration',
            'body' => "Guys, gue lagi setup project Laravel baru buat tugas akhir.\n\nPas jalanin `php artisan migrate`, dapet error:\n\n```\nIlluminate\\Database\\QueryException\nSQLSTATE[HY000] [2002] Connection refused\n```\n\nUdah coba ganti `DB_HOST` ke `127.0.0.1` tapi tetep gabisa. Ada yang tau solusinya?",
            'vote_count' => 3,
            'reply_count' => 2,
            'last_activity_at' => now()->subHours(2),
        ]);

        $reply1 = Reply::create([
            'thread_id' => $thread1->id,
            'user_id' => $studentD->id,
            'body' => "Coba cek dulu MySQL service-nya udah running belum.\n\nDi Windows:\n```bash\nnet start mysql\n```\n\nKalau pakai XAMPP, pastiin MySQL-nya udah di-start dari XAMPP Control Panel.\n\nTerus cek juga file `.env` lu, pastiin `DB_PORT`-nya bener (default MySQL: 3306).",
            'is_best_answer' => true,
            'vote_count' => 5,
        ]);

        Reply::create([
            'thread_id' => $thread1->id,
            'user_id' => $studentB->id,
            'body' => "Setuju sama Dimas. Gue juga pernah ngalamin ini, ternyata MySQL-nya belom di-start. 😅",
            'vote_count' => 1,
        ]);

        // Create votes for thread 1
        Vote::create(['user_id' => $studentB->id, 'voteable_type' => Thread::class, 'voteable_id' => $thread1->id, 'value' => 1]);
        Vote::create(['user_id' => $studentC->id, 'voteable_type' => Thread::class, 'voteable_id' => $thread1->id, 'value' => 1]);
        Vote::create(['user_id' => $studentD->id, 'voteable_type' => Thread::class, 'voteable_id' => $thread1->id, 'value' => 1]);

        // Votes for the best answer
        Vote::create(['user_id' => $ketuaKelas->id, 'voteable_type' => Reply::class, 'voteable_id' => $reply1->id, 'value' => 1]);
        Vote::create(['user_id' => $studentB->id, 'voteable_type' => Reply::class, 'voteable_id' => $reply1->id, 'value' => 1]);
        Vote::create(['user_id' => $studentC->id, 'voteable_type' => Reply::class, 'voteable_id' => $reply1->id, 'value' => 1]);
        Vote::create(['user_id' => $teacher->id, 'voteable_type' => Reply::class, 'voteable_id' => $reply1->id, 'value' => 1]);

        // Thread 2: Pinned announcement
        Thread::create([
            'forum_channel_id' => $forumGeneral->id,
            'user_id' => $teacher->id,
            'title' => '📌 Jadwal Presentasi Tugas Akhir',
            'body' => "## Jadwal Presentasi Tugas Akhir\n\n**Tanggal:** 20 Mei 2026\n**Waktu:** 08:00 - 15:00 WIB\n**Tempat:** Lab Komputer 2\n\n### Urutan Presentasi:\n1. Kelompok 1 — Andi & Budi (E-Commerce)\n2. Kelompok 2 — Citra & Dimas (Sistem Informasi Sekolah)\n\n> Pastikan semua kelompok sudah push final code ke GitHub H-1 sebelum presentasi.\n\nGood luck semuanya! 💪",
            'is_pinned' => true,
            'vote_count' => 4,
            'reply_count' => 0,
            'last_activity_at' => now()->subDays(1),
        ]);

        // Thread 3: Q&A
        Thread::create([
            'forum_channel_id' => $forumBugReport->id,
            'user_id' => $studentC->id,
            'title' => 'Cara install TailwindCSS di project Vite?',
            'body' => "Mau tanya dong, cara install TailwindCSS yang bener di project Vite gimana ya?\n\nGue udah coba `npm install tailwindcss` tapi pas import di CSS gabisa.",
            'vote_count' => 1,
            'reply_count' => 1,
            'last_activity_at' => now()->subHours(5),
        ]);

        // ─── 7. Create Chat Channels ─────────────────────
        $chatGeneral = ChatChannel::create([
            'class_id' => $classXII->id,
            'name' => 'General',
            'description' => 'Obrolan santai anak-anak kelas',
            'type' => 'general',
            'created_by' => $ketuaKelas->id,
        ]);

        ChatChannel::create([
            'class_id' => $classXII->id,
            'name' => 'Pengumuman',
            'description' => 'Pengumuman penting dari guru dan ketua kelas',
            'type' => 'announcement',
            'created_by' => $teacher->id,
        ]);

        ChatChannel::create([
            'class_id' => $classXII->id,
            'name' => 'Tugas Kelompok 1',
            'description' => 'Koordinasi tugas kelompok Andi & Budi',
            'type' => 'group',
            'created_by' => $ketuaKelas->id,
        ]);

        // ─── 8. Create Messages ──────────────────────────
        Message::create([
            'chat_channel_id' => $chatGeneral->id,
            'user_id' => $ketuaKelas->id,
            'body' => 'Woi, besok ada ulangan Basis Data ga sih? 😰',
            'type' => 'text',
        ]);

        Message::create([
            'chat_channel_id' => $chatGeneral->id,
            'user_id' => $studentC->id,
            'body' => 'Iya ada, materi normalisasi sampe 3NF',
            'type' => 'text',
        ]);

        Message::create([
            'chat_channel_id' => $chatGeneral->id,
            'user_id' => $studentD->id,
            'body' => 'Yang penting pahamin konsep 1NF, 2NF, 3NF. Biasanya soalnya studi kasus.',
            'type' => 'text',
        ]);

        Message::create([
            'chat_channel_id' => $chatGeneral->id,
            'user_id' => $studentB->id,
            'body' => 'Gue masih bingung bedanya 2NF sama 3NF 😭',
            'type' => 'text',
        ]);

        Message::create([
            'chat_channel_id' => $chatGeneral->id,
            'user_id' => $studentD->id,
            'body' => "Singkatnya:\n- **2NF**: Semua kolom non-key harus bergantung ke SELURUH primary key (bukan cuma sebagian)\n- **3NF**: Ga boleh ada transitive dependency. Kolom non-key ga boleh bergantung ke kolom non-key lainnya.\n\nContoh nanti gue share di forum aja biar ga tenggelam.",
            'type' => 'text',
        ]);

        // ─── Done! ──────────────────────────────────────
        $this->command->info('');
        $this->command->info('🐝 Hive seeded successfully!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info("   Schools:        {$school->id}");
        $this->command->info("   Users:          " . User::count());
        $this->command->info("   Classes:        " . ClassRoom::count());
        $this->command->info("   Class Members:  " . ClassMember::count());
        $this->command->info("   Forum Channels: " . ForumChannel::count());
        $this->command->info("   Threads:        " . Thread::count());
        $this->command->info("   Replies:        " . Reply::count());
        $this->command->info("   Votes:          " . Vote::count());
        $this->command->info("   Chat Channels:  " . ChatChannel::count());
        $this->command->info("   Messages:       " . Message::count());
        $this->command->info('');
        $this->command->info('🔑 Login credentials (all passwords: "password"):');
        $this->command->info('   Teacher:   budi.santoso@smkn1.sch.id');
        $this->command->info('   Moderator: andi@student.smkn1.sch.id');
        $this->command->info('   Student:   budi.r@student.smkn1.sch.id');
    }
}
