import { Infer, v } from "convex/values";

export const seedDataValidator = v.object({
  courses: v.array(
    v.object({
      code: v.string(),
      title: v.string(),
      department: v.string(),
      year: v.string(),
    }),
  ),
  timetable: v.array(
    v.object({
      day: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      subject: v.string(),
      type: v.union(v.literal("LECTURE"), v.literal("LAB")),
      room: v.string(),
      department: v.string(),
      year: v.string(),
    }),
  ),
  events: v.array(
    v.object({
      title: v.string(),
      date: v.string(),
      type: v.union(v.literal("QUIZ"), v.literal("SYMPOSIUM"), v.literal("EXAM")),
      description: v.optional(v.string()),
    }),
  ),
  circulars: v.array(
    v.object({
      title: v.string(),
      body: v.string(),
      category: v.string(),
      publishedAt: v.string(),
    }),
  ),
  libraryItems: v.array(
    v.object({
      title: v.string(),
      author: v.string(),
      type: v.union(v.literal("BOOK"), v.literal("JOURNAL"), v.literal("NOTES")),
      category: v.string(),
    }),
  ),
  extracurriculars: v.array(
    v.object({
      title: v.string(),
      category: v.string(),
      description: v.optional(v.string()),
    }),
  ),
  otherStudents: v.array(
    v.object({
      rollNo: v.string(),
      name: v.string(),
      year: v.string(),
      department: v.string(),
      program: v.string(),
      section: v.string(),
    }),
  ),
});

export type SeedData = Infer<typeof seedDataValidator>;

export const seedData: SeedData = {
  courses: [
    { code: "MA23C01", title: "Mathematics", department: "CSE", year: "2" },
    { code: "CS23C02", title: "Data Structures", department: "CSE", year: "2" },
    { code: "CS23C03", title: "Data Structures Lab", department: "CSE", year: "2" },
    { code: "EN23A04", title: "English", department: "HUM", year: "2" },
    { code: "CS23C05", title: "Operating Systems", department: "CSE", year: "2" },
    { code: "CS23C06", title: "Digital Electronics", department: "CSE", year: "2" },
  ],
  timetable: [
    { day: "Monday", startTime: "09:00", endTime: "10:00", subject: "Mathematics", type: "LECTURE", room: "A-201", department: "CSE", year: "2" },
    { day: "Monday", startTime: "10:15", endTime: "11:15", subject: "Data Structures", type: "LAB", room: "Lab-3", department: "CSE", year: "2" },
    { day: "Monday", startTime: "13:00", endTime: "14:00", subject: "English", type: "LECTURE", room: "B-104", department: "CSE", year: "2" },
    { day: "Tuesday", startTime: "09:00", endTime: "10:00", subject: "Operating Systems", type: "LECTURE", room: "A-203", department: "CSE", year: "2" },
    { day: "Tuesday", startTime: "11:30", endTime: "12:30", subject: "Digital Electronics", type: "LECTURE", room: "A-206", department: "CSE", year: "2" },
    { day: "Wednesday", startTime: "10:15", endTime: "11:15", subject: "Data Structures", type: "LECTURE", room: "A-201", department: "CSE", year: "2" },
    { day: "Thursday", startTime: "09:00", endTime: "10:00", subject: "Mathematics", type: "LECTURE", room: "A-201", department: "CSE", year: "2" },
    { day: "Thursday", startTime: "14:00", endTime: "16:00", subject: "Data Structures Lab", type: "LAB", room: "Lab-3", department: "CSE", year: "2" },
    { day: "Friday", startTime: "09:00", endTime: "10:00", subject: "English", type: "LECTURE", room: "B-104", department: "CSE", year: "2" },
    { day: "Friday", startTime: "11:30", endTime: "12:30", subject: "Operating Systems", type: "LECTURE", room: "A-203", department: "CSE", year: "2" },
  ],
  events: [
    { title: "Quiz - Data Structures", date: "2026-09-25", type: "QUIZ", description: "Unit test covering trees and graphs" },
    { title: "Technical Symposium", date: "2026-09-28", type: "SYMPOSIUM", description: "Inter-college tech fest, paper presentation and hackathon" },
    { title: "End Semester Exams", date: "2026-11-10", type: "EXAM", description: "Semester 4 examinations begin" },
  ],
  circulars: [
    {
      title: "New circular released",
      body: "The semester examination timetable has been published. Check the Examinations page for details.",
      category: "Academics",
      publishedAt: "2026-09-20",
    },
    {
      title: "Attendance below 75%",
      body: "Students with attendance below 75% will not be permitted to write the end semester examinations. Contact your tutor for condonation details.",
      category: "Academics",
      publishedAt: "2026-09-18",
    },
    {
      title: "Technical Symposium registration",
      body: "Registration for the annual technical symposium is open until 25 September. Register at the department office.",
      category: "Events",
      publishedAt: "2026-09-15",
    },
    {
      title: "Library book return notice",
      body: "All borrowed books must be returned before the end semester examinations begin.",
      category: "Library",
      publishedAt: "2026-09-12",
    },
    {
      title: "Fee payment window open",
      body: "The college fee payment window for the semester is open until 30 September. Pay online through the Payments page.",
      category: "Administration",
      publishedAt: "2026-09-10",
    },
  ],
  libraryItems: [
    { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest & Stein", type: "BOOK", category: "Computer Science" },
    { title: "Data Structures and Algorithms in Java", author: "Robert Lafore", type: "BOOK", category: "Computer Science" },
    { title: "Operating System Concepts", author: "Silberschatz & Galvin", type: "BOOK", category: "Computer Science" },
    { title: "Discrete Mathematics and its Applications", author: "Kenneth Rosen", type: "BOOK", category: "Mathematics" },
    { title: "Higher Engineering Mathematics", author: "B.S. Grewal", type: "BOOK", category: "Mathematics" },
    { title: "IEEE Transactions on Computers", author: "IEEE", type: "JOURNAL", category: "Computer Science" },
    { title: "ACM Computing Surveys", author: "ACM", type: "JOURNAL", category: "Computer Science" },
    { title: "Data Structures Lecture Notes", author: "CSE Department", type: "NOTES", category: "Computer Science" },
    { title: "Operating Systems Handout", author: "CSE Department", type: "NOTES", category: "Computer Science" },
  ],
  extracurriculars: [
    { title: "Coding Club", category: "CLUB", description: "Weekly programming contests and workshops" },
    { title: "Robotics Club", category: "CLUB", description: "Build and compete with robots" },
    { title: "Basketball Team", category: "SPORTS", description: "College basketball team tryouts each August" },
    { title: "Athletics", category: "SPORTS", description: "Track and field events at the annual sports meet" },
    { title: "NSS", category: "SERVICE", description: "National Service Scheme community outreach" },
    { title: "NCC", category: "SERVICE", description: "National Cadet Corps" },
    { title: "Tech Symposium Volunteer", category: "SYMPOSIUM", description: "Help organize the annual technical symposium" },
    { title: "Quiz Team", category: "SYMPOSIUM", description: "Represent your college at inter-college quizzes" },
  ],
  otherStudents: [
    { rollNo: "23CE001", name: "Aarav Kumar", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE002", name: "Diya Sharma", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE003", name: "Rohit Verma", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "B" },
    { rollNo: "23CE004", name: "Ishita Nair", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "B" },
    { rollNo: "23CE005", name: "Karthik Raj", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE006", name: "Meera Iyer", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE007", name: "Sanjay Prabhu", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "B" },
    { rollNo: "23CE008", name: "Ananya Pillai", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE009", name: "Vikram Menon", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "B" },
    { rollNo: "23CE010", name: "Priya Sundaram", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
    { rollNo: "23CE011", name: "Aditya Krishnan", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "B" },
    { rollNo: "23CE012", name: "Nithya Balaji", year: "2", department: "CSE", program: "B.Tech Computer Science", section: "A" },
  ],
};
