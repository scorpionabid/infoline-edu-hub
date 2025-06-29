# İnfoLine - Məktəb Məlumatları Toplama Sistemi

## 📖 Layihə Haqqında

İnfoLine, Azərbaycanda 600+ məktəbi əhatə edən mərkəzləşdirilmiş veb platformadır. Bu sistem təhsil sahəsində statistik məlumatların toplanması, analizi və hesabatlandırılması üçün nəzərdə tutulmuşdur.

### 🎯 Əsas Xüsusiyyətlər
- **4 rol sistemi**: SuperAdmin, RegionAdmin, SectorAdmin, SchoolAdmin
- **Microsoft Forms üslubunda** məlumat daxil etmə interfeysi
- **Real-time təsdiqləmə** prosesi
- **Excel import/export** dəstəyi
- **4 dil dəstəyi**: Azərbaycan, İngilis, Rus, Türk
- **Mobil uyğun** responsive dizayn

### 📊 Sistem Arxitekturası
```
Regions (Bölgələr)
├── Sectors (Sektorlar)
    ├── Schools (Məktəblər)
        ├── Categories (Kateqoriyalar)
            ├── Columns (Sütunlar)
                └── Data Entries (Məlumatlar)
```

---

## 📚 İstifadəçi Təlimatları

Sistem istifadəçiləri üçün ətraflı təlimatlar [`docs/user-guides/`](./docs/user-guides/) qovluğunda yerləşir:

### 🏫 [Məktəb Admini üçün](./docs/user-guides/school-admin-guide.md)
- Məlumat daxil etmə prosesi
- Excel import/export
- Status izləmə

### 🏛️ [Sektor Admini üçün](./docs/user-guides/sector-admin-guide.md)  
- Məktəb idarəetməsi
- Məlumat təsdiqləmə
- Bildiriş göndərmə

### 🌍 [Region Admini üçün](./docs/user-guides/region-admin-guide.md)
- Sektor və məktəb idarəetməsi
- Kateqoriya yaratma
- Hesabat və analitika

### ⚡ [SuperAdmin üçün](./docs/user-guides/superadmin-guide.md)
- Sistem idarəetməsi
- Monitorinq və performance
- Backup və recovery

---

## 🚀 Development

### Texniki Stack
- **Frontend**: React, TypeScript, Vite
- **UI Library**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deployment**: Lovable.dev platform

### 🛠️ Local Development

```sh
# Repository clone
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Dependencies install
npm install

# Development server başlat
npm run dev
```

### 📁 Proyekt Strukturu
```
src/
├── components/          # React komponentləri
│   ├── dashboard/       # Dashboard komponentləri
│   ├── dataEntry/       # Məlumat daxil etmə
│   ├── auth/           # Autentifikasiya
│   └── ui/             # UI komponentləri
├── hooks/              # Custom React hooks
├── pages/              # Səhifə komponentləri
├── services/           # API və xidmət funksiyaları
├── types/              # TypeScript tip tərifləri
├── translations/       # Çoxdilli dəstək
└── utils/              # Yardımçı funksiyalar

docs/
└── user-guides/        # İstifadəçi təlimatları
```

---

## 🔧 Deployment

### Lovable Platform
```sh
# Lovable-də deploy
# Sadəcə Share -> Publish düyməsinə basın
```

### Custom Domain
Öz domain istifadə etmək üçün [Netlify deployment](https://docs.lovable.dev/tips-tricks/custom-domain/) baxın.

---

## 📈 Verilənlər Bazası

### Supabase Konfiqurasiyası
- **PostgreSQL** verilənlər bazası
- **Row Level Security (RLS)** rol-əsaslı icazələr
- **Edge Functions** serverless backend
- **Real-time** məlumat sinxronizasiyası

### Əsas Cədvəllər
- `profiles` - İstifadəçi profilleri
- `user_roles` - İstifadəçi rolları
- `regions` - Bölgələr
- `sectors` - Sektorlar  
- `schools` - Məktəblər
- `categories` - Kateqoriyalar
- `columns` - Sütunlar
- `data_entries` - Məlumat girişləri

---

## 🔐 Təhlükəsizlik

### Autentifikasiya
- **JWT-based** session idarəetməsi
- **Role-based access control (RBAC)**
- **Multi-factor authentication** dəstəyi

### Data Security
- **Row Level Security** (RLS) siyasətləri
- **SQL injection** müdafiəsi
- **XSS protection** 
- **CSRF protection**

---

## 🌍 Beynəlmiləlləşdirmə

Sistem 4 dili dəstəkləyir:
- 🇦🇿 **Azərbaycan** (əsas dil)
- 🇬🇧 **İngilis**
- 🇷🇺 **Rus** 
- 🇹🇷 **Türk**

Tərcümə faylları `src/translations/` qovluğundadır.

---

## 📊 Performance

### Texniki Göstəricilər
- **Səhifə yüklənmə vaxtı**: <1 saniyə
- **API cavab vaxtı**: <500ms
- **Eyni anda istifadəçi**: 100+ aktiv
- **Uptime**: 99.9%

### Optimallaşdırma
- **Code splitting** və lazy loading
- **Image optimization** 
- **API response caching**
- **Database query optimization**

---

## 🤝 İnkişaf Prosesi

### Git Workflow
```sh
# Feature branch yaratmaq
git checkout -b feature/new-functionality

# Dəyişiklikləri commit etmək  
git commit -m "feat: add new functionality"

# Main branch-ə merge etmək
git checkout main
git merge feature/new-functionality
```

### Kod Standartları
- **TypeScript** strict mode
- **ESLint** və **Prettier** konfiqurasiyası
- **React Hooks** best practices
- **Performance-first** development

---

## 📞 Dəstək və Əlaqə

### Texniki Dəstək
- **GitHub Issues**: [Yeni issue yarat](https://github.com/[repo]/issues)
- **E-poçt**: support@infoline.az
- **Lovable Platform**: [Layihə linki](https://lovable.dev/projects/22cfbf06-26bf-4e40-8210-68181ed0c737)

### Komanda
- **Technical Lead**: [Ad Soyad]
- **Frontend Developer**: [Ad Soyad]
- **UI/UX Designer**: [Ad Soyad]
- **Database Administrator**: [Ad Soyad]

---

## 📝 Lisenziya

Bu layihə MIT lisenziyası altında paylaşılır. Detallar üçün [LICENSE](./LICENSE) faylına baxın.

---

## 🙏 Təşəkkürlər

- **Supabase** team - Backend infrastructure
- **Lovable.dev** - Development platform  
- **shadcn/ui** - UI component library
- **Beta testerləri** - Quality assurance və feedback

---

**🔄 Son yenilənmə**: 2025-01-XX  
**📊 Versiya**: v2.1.0  
**🌟 Status**: Production Ready