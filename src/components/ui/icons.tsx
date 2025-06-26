
import React from "react";
import { 
  AlignLeft, 
  Calendar, 
  CalendarClock,
  Check,
  CheckCircle,
  Circle,
  Clock,
  File,
  FileEdit,
  FileUp,
  Hash,
  Image,
  Link,
  ListChecks,
  Mail,
  Palette,
  Phone,
  Lock,
  Sliders,
  Text,
  Type,
  ListFilter,
  LucideIcon,
  // LucideProps
} from "lucide-react";

// Mövcud olmayan Icon-lar üçün aliaslar yaradırıq
const ListChoice: React.FC<LucideProps> = (props) => (
  <ListFilter {...props} />
);

const CircleCheck: React.FC<LucideProps> = (props) => (
  <CheckCircle {...props} />
);

export const Icons = {
  text: Text,
  alignLeft: AlignLeft,
  hash: Hash,
  listChoice: ListChoice,
  calendar: Calendar,
  check: Check,
  circleCheck: CircleCheck,
  fileUp: FileUp,
  mail: Mail,
  link: Link,
  phone: Phone,
  image: Image,
  sliders: Sliders,
  palette: Palette,
  lock: Lock,
  clock: Clock,
  calendarClock: CalendarClock,
  fileEdit: FileEdit,
  circle: Circle
};
