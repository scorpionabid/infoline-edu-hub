import { NotificationType } from "@/types/notification";
import { FormItem, FormStatus, ChartData } from "@/types/dashboard";

// Demo bildirişlər
export const mockNotifications = [
  {
    id: "1",
    type: 'deadline' as NotificationType,
    title: "Son tarix xatırlatması",
    message: "\"Müəllim kadrları\" bölməsinin son təqdim etmə tarixi bu gündür.",
    createdAt: "2023-09-15T08:30:00Z",
    time: "2023-09-15T08:30:00Z",
    isRead: false,
    userId: "user123",
    priority: "normal",
    read_status: false
  },
  {
    id: "2",
    type: 'approved' as NotificationType,
    title: "Məlumatlar təsdiqləndi",
    message: "\"Şagird sayı\" bölməsi üzrə məlumatlarınız təsdiqləndi.",
    createdAt: "2023-09-14T15:45:00Z",
    time: "2023-09-14T15:45:00Z",
    isRead: true,
    userId: "user123",
    priority: "high",
    read_status: true
  }
];

// Demo form elementləri
export const mockFormItems: FormItem[] = [
  {
    id: "1",
    title: "Müəllim məlumatları",
    status: "pending" as FormStatus,
    completionPercentage: 45,
    deadline: "2023-09-20T23:59:59Z",
    category: "Kadrlar"
  },
  {
    id: "2",
    title: "Infrastruktur məlumatları",
    status: "approved" as FormStatus,
    completionPercentage: 80,
    deadline: "2023-09-22T23:59:59Z",
    category: "İnfrastruktur"
  },
  {
    id: "3",
    title: "Şagird məlumatları",
    status: "rejected" as FormStatus,
    completionPercentage: 20,
    deadline: "2023-09-25T23:59:59Z",
    category: "Şagirdlər"
  }
];

// Demo chart məlumatları
export const mockChartData: ChartData = {
  activityData: [
    { name: "Sentyabr", value: 45 },
    { name: "Oktyabr", value: 60 },
    { name: "Noyabr", value: 35 },
    { name: "Dekabr", value: 70 }
  ],
  regionSchoolsData: [
    { name: "Bakı", value: 120 },
    { name: "Gəncə", value: 80 },
    { name: "Sumqayıt", value: 50 }
  ],
  categoryCompletionData: [
    { name: "Müəllimlər", completed: 75 },
    { name: "Şagirdlər", completed: 60 },
    { name: "İnfrastruktur", completed: 90 }
  ]
};
