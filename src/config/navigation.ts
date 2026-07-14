export const publicNavItems = [
  { href: "/courses", labelKey: "nav.courses" },
  { href: "/tutors", labelKey: "nav.tutors" },
  { href: "/events", labelKey: "nav.events" },
  { href: "/stem-kits", labelKey: "nav.stemKits" },
  { href: "/how-it-works", labelKey: "nav.howItWorks" },
  { href: "/for-schools", labelKey: "nav.forSchools" },
  { href: "/pricing", labelKey: "nav.pricing" },
] as const;

export type Role = "STUDENT" | "PARENT" | "TUTOR" | "ADMIN" | "SUPER_ADMIN" | "B2B_PARTNER" | "ORG_ADMIN";

type NavItem = { href: string; labelKey: string; icon: string };

const accountItems: NavItem[] = [
  { href: "/account", labelKey: "nav.account", icon: "UserCog" },
  { href: "/notifications", labelKey: "nav.notifications", icon: "Bell" },
  { href: "/help", labelKey: "nav.help", icon: "HelpCircle" },
];

const adminItems: NavItem[] = [
  { href: "/admin", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
  { href: "/admin/users", labelKey: "nav.users", icon: "Users" },
  { href: "/admin/courses", labelKey: "nav.courses", icon: "BookOpen" },
  { href: "/admin/bundles", labelKey: "nav.bundles", icon: "Layers" },
  { href: "/admin/pathways", labelKey: "nav.pathways", icon: "Map" },
  { href: "/admin/curriculum", labelKey: "nav.curriculum", icon: "GitBranch" },
  { href: "/admin/ai-content", labelKey: "nav.aiContent", icon: "Bot" },
  { href: "/admin/products", labelKey: "nav.products", icon: "Package" },
  { href: "/admin/events", labelKey: "nav.events", icon: "Sparkles" },
  { href: "/admin/competitions", labelKey: "nav.competitions", icon: "Trophy" },
  { href: "/admin/certificates", labelKey: "nav.certificates", icon: "GraduationCap" },
  { href: "/admin/bundle-submissions", labelKey: "nav.bundleSubmissions", icon: "Inbox" },
  { href: "/admin/badges", labelKey: "nav.badges", icon: "Award" },
  { href: "/admin/pages", labelKey: "nav.pages", icon: "FileText" },
  { href: "/admin/help", labelKey: "nav.helpArticles", icon: "HelpCircle" },
  { href: "/admin/tutors", labelKey: "nav.tutors", icon: "ShieldCheck" },
  { href: "/admin/roles", labelKey: "nav.roles", icon: "Lock" },
  { href: "/admin/audit", labelKey: "nav.audit", icon: "ClipboardList" },
  { href: "/admin/settings", labelKey: "nav.settings", icon: "Settings" },
];

export const dashboardNavItems: Record<Role, NavItem[]> = {
  STUDENT: [
    { href: "/student", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
    { href: "/student/courses", labelKey: "nav.myCourses", icon: "BookOpen" },
    { href: "/student/assignments", labelKey: "nav.assignments", icon: "ClipboardList" },
    { href: "/student/portfolio", labelKey: "nav.portfolio", icon: "Briefcase" },
    { href: "/student/badges", labelKey: "nav.badges", icon: "Award" },
    { href: "/student/certificates", labelKey: "nav.certificates", icon: "GraduationCap" },
    { href: "/student/bookings", labelKey: "nav.bookings", icon: "Calendar" },
    { href: "/messages", labelKey: "nav.messages", icon: "MessageSquare" },
    ...accountItems,
  ],
  PARENT: [
    { href: "/parent", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
    { href: "/parent/children", labelKey: "nav.children", icon: "Users" },
    { href: "/parent/orders", labelKey: "nav.orders", icon: "ShoppingBag" },
    { href: "/messages", labelKey: "nav.messages", icon: "MessageSquare" },
    ...accountItems,
  ],
  TUTOR: [
    { href: "/tutor", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
    { href: "/tutor/teaching", labelKey: "nav.teaching", icon: "ClipboardList" },
    { href: "/tutor/profile", labelKey: "nav.profile", icon: "User" },
    { href: "/tutor/availability", labelKey: "nav.availability", icon: "Clock" },
    { href: "/tutor/bookings", labelKey: "nav.bookings", icon: "Calendar" },
    { href: "/tutor/students", labelKey: "nav.students", icon: "Users" },
    { href: "/messages", labelKey: "nav.messages", icon: "MessageSquare" },
    ...accountItems,
  ],
  ADMIN: adminItems,
  SUPER_ADMIN: adminItems,
  // B2B_PARTNER / ORG_ADMIN have no dedicated dashboard yet (deferred). Until
  // one exists they land on /account with a minimal, non-looping nav. Pointing
  // them at /admin bounced them (the admin layout rejects non-admin roles),
  // which produced an infinite /dashboard ↔ /admin redirect loop.
  B2B_PARTNER: [...accountItems],
  ORG_ADMIN: [...accountItems],
};
