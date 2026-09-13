import { 
  UserRole, 
  UserStatus,
  TraineeProfile, 
  TrainerProfile, 
  Course, 
  CourseEnrollment, 
  Assessment, 
  AssessmentAttempt, 
  Certificate, 
  TrainerResource, 
  Announcement,
  CourseFeedback,
  CompetencyItem,
  MentorshipSession,
  SkillGapDemand,
  TrainerWorkshop,
  JobOpportunity,
  InternshipOpportunity,
  StudentCohortRecord
} from '@/types/capacityConnect';

// Initial Mock/Seed Trainers
export const INITIAL_TRAINERS: TrainerProfile[] = [
  {
    id: 'trainer-1',
    userId: 'user-trainer-1',
    name: 'Dr. Rakesh Sharma',
    email: 'rakesh.sharma@capacityconnect.edu',
    qualification: 'Ph.D. in Computer Science (IIT Delhi)',
    yearsOfExperience: 9,
    specialization: 'Artificial Intelligence & Machine Learning',
    bio: 'Former senior ML scientist with 20+ publications and extensive experience building high-throughput predictive systems and deep neural architectures.',
    competencies: [
      { name: 'Python', proficiency: 95 },
      { name: 'Machine Learning', proficiency: 94 },
      { name: 'Deep Learning', proficiency: 90 },
      { name: 'Statistics', proficiency: 88 },
      { name: 'Data Structures', proficiency: 85 }
    ],
    subjects: ['Machine Learning', 'Data Science', 'Python Programming', 'Advanced Algorithms'],
    certifications: ['AWS Certified Machine Learning Specialty', 'TensorFlow Developer Certificate', 'DeepLearning.AI Fellow'],
    rating: 4.9,
    totalStudentsTaught: 1240,
    coursesCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'trainer-2',
    userId: 'user-trainer-2',
    name: 'Priya Narayanan',
    email: 'priya.narayanan@capacityconnect.edu',
    qualification: 'M.Tech Software Engineering (NIT Trichy)',
    yearsOfExperience: 7,
    specialization: 'Distributed Enterprise Systems & Backend Architecture',
    bio: 'Full-stack principal architect specialized in high-performance Java microservices, PostgreSQL query optimization, and resilient API gateways.',
    competencies: [
      { name: 'Java', proficiency: 96 },
      { name: 'SQL', proficiency: 92 },
      { name: 'Data Structures', proficiency: 90 },
      { name: 'OOP', proficiency: 94 },
      { name: 'Git', proficiency: 88 },
      { name: 'REST APIs', proficiency: 91 }
    ],
    subjects: ['Java Programming', 'Database Systems', 'Enterprise Software Design', 'Data Structures & Algorithms'],
    certifications: ['Oracle Certified Java Enterprise Architect', 'AWS Certified Solutions Architect', 'PostgreSQL Certified Professional'],
    rating: 4.8,
    totalStudentsTaught: 980,
    coursesCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'trainer-3',
    userId: 'user-trainer-3',
    name: 'Amit Vikram Verma',
    email: 'amit.verma@capacityconnect.edu',
    qualification: 'B.Tech CSE, Executive PG in Cloud Systems',
    yearsOfExperience: 8,
    specialization: 'Cloud Infrastructure & Modern Web Technologies',
    bio: 'DevOps & React tech lead who has scaled platforms to millions of daily active users across India and SE Asia.',
    competencies: [
      { name: 'React', proficiency: 94 },
      { name: 'JavaScript', proficiency: 95 },
      { name: 'Docker', proficiency: 89 },
      { name: 'Git', proficiency: 92 },
      { name: 'HTML/CSS', proficiency: 96 },
      { name: 'REST APIs', proficiency: 90 }
    ],
    subjects: ['Frontend Development', 'Modern JavaScript', 'Cloud & DevOps Automation', 'UI Architecture'],
    certifications: ['Certified Kubernetes Administrator (CKA)', 'Meta Certified Frontend Developer', 'AWS DevOps Professional'],
    rating: 4.85,
    totalStudentsTaught: 1100,
    coursesCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// Initial Mock/Seed Courses
export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Enterprise Java & Data Structures Architecture',
    description: 'Master core-to-advanced Java concepts, algorithmic design, and enterprise-grade data structures to crack premier technical roles.',
    category: 'Technology',
    subject: 'Data Structures & OOP',
    difficulty: 'Intermediate',
    duration: '8 weeks (32 hours)',
    trainerId: 'trainer-2',
    trainerName: 'Priya Narayanan',
    trainerExperience: '7+ years experience',
    rating: 4.9,
    enrolledCount: 342,
    requiredCompetencies: [
      { name: 'Java Basics', minLevel: 40 },
      { name: 'Basic Logic', minLevel: 50 }
    ],
    learningOutcomes: [
      'Implement custom linked lists, trees, graphs, and hash tables from scratch',
      'Optimize algorithm time and space complexity with Big-O analysis',
      'Design clean modular object-oriented applications complying with SOLID principles',
      'Deploy an automated unit-tested banking backend application'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    status: 'published',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    modules: [
      {
        id: 'mod-1-1',
        title: 'Module 1: Advanced OOP & JVM Internals',
        description: 'Deep dive into polymorphism, memory allocation, garbage collection, and robust exception architectures.',
        durationMinutes: 45,
        videoUrl: 'https://www.youtube.com/embed/WlzRs16TzuQ',
        presentationUrl: 'https://capacityconnect.edu/materials/java-oop-slides.pdf',
        pdfUrl: 'https://capacityconnect.edu/materials/java-architecture-handbook.pdf',
        notes: 'Review encapsulation boundaries and thread safety before starting Module 2 exercises.',
        assessmentId: 'assess-1'
      },
      {
        id: 'mod-1-2',
        title: 'Module 2: Core Data Structures Implementation',
        description: 'Constructing dynamic arrays, balanced binary trees, and priority queues with zero library dependencies.',
        durationMinutes: 60,
        videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc',
        notes: 'Implement custom hash collisions handling using separate chaining in Java.'
      },
      {
        id: 'mod-1-3',
        title: 'Module 3: Graph Algorithms & Dynamic Programming',
        description: 'BFS, DFS, Dijkstra shortest path, and memoized recursion patterns applied to real industry scenarios.',
        durationMinutes: 75,
        videoUrl: 'https://www.youtube.com/embed/nu_pCVPKzTk',
        notes: 'Solve the top 10 dynamic programming patterns in the practice repository.'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Practical Machine Learning & Statistical Analysis',
    description: 'Transform raw data into predictive intelligence with Python, Scikit-Learn, Pandas, and exploratory statistical modeling.',
    category: 'Data Science',
    subject: 'Machine Learning',
    difficulty: 'Intermediate',
    duration: '10 weeks (40 hours)',
    trainerId: 'trainer-1',
    trainerName: 'Dr. Rakesh Sharma',
    trainerExperience: '9+ years experience',
    rating: 4.88,
    enrolledCount: 285,
    requiredCompetencies: [
      { name: 'Python', minLevel: 60 },
      { name: 'Basic Math', minLevel: 50 }
    ],
    learningOutcomes: [
      'Formulate regression and classification pipelines using Scikit-Learn',
      'Perform rigorous statistical feature engineering and outlier detection',
      'Evaluate predictive accuracy with ROC-AUC, confusion matrices, and cross-validation',
      'Deploy a containerized real-time inference model via FastAPI'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    status: 'published',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Statistical Foundations & Exploratory Analysis',
        description: 'Probability distributions, hypothesis testing, and multidimensional visualization with Seaborn and Pandas.',
        durationMinutes: 50,
        videoUrl: 'https://www.youtube.com/embed/7eh4d6sabA0',
        pdfUrl: 'https://capacityconnect.edu/materials/applied-statistics-primer.pdf',
        assessmentId: 'assess-2'
      },
      {
        id: 'mod-2-2',
        title: 'Module 2: Supervised Learning Architectures',
        description: 'Linear & logistic regression, decision trees, random forests, and gradient boosting mechanisms.',
        durationMinutes: 65,
        videoUrl: 'https://www.youtube.com/embed/1UXOdCBNdgE',
        notes: 'Practice feature scaling and hyperparameter tuning with GridSearchCV.'
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Advanced Relational SQL & Database Optimization',
    description: 'Master complex queries, indexing strategies, query execution plans, transactions, and relational data architecture.',
    category: 'Technology',
    subject: 'Database Systems',
    difficulty: 'Beginner to Intermediate',
    duration: '6 weeks (24 hours)',
    trainerId: 'trainer-2',
    trainerName: 'Priya Narayanan',
    trainerExperience: '7+ years experience',
    rating: 4.82,
    enrolledCount: 410,
    requiredCompetencies: [
      { name: 'Problem Solving', minLevel: 40 }
    ],
    learningOutcomes: [
      'Write multi-table CTEs, window functions, and correlated subqueries',
      'Analyze EXPLAIN ANALYZE execution plans to eliminate table scans',
      'Design normalized 3NF schemas with referential integrity and indexes',
      'Handle concurrent transactions and ACID locking mechanisms'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    status: 'published',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Module 1: Analytical Querying & Window Functions',
        description: 'PARTITION BY, ranking functions, rolling sums, and recursive Common Table Expressions.',
        durationMinutes: 45,
        videoUrl: 'https://www.youtube.com/embed/WlzRs16TzuQ',
        assessmentId: 'assess-3'
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Modern Full-Stack React & Cloud Architecture',
    description: 'Build production-ready, performant frontend applications coupled with serverless backend APIs and CI/CD pipelines.',
    category: 'Technology',
    subject: 'Web Development',
    difficulty: 'Intermediate',
    duration: '8 weeks (32 hours)',
    trainerId: 'trainer-3',
    trainerName: 'Amit Vikram Verma',
    trainerExperience: '8+ years experience',
    rating: 4.87,
    enrolledCount: 520,
    requiredCompetencies: [
      { name: 'JavaScript', minLevel: 55 },
      { name: 'HTML/CSS', minLevel: 50 }
    ],
    learningOutcomes: [
      'Architect modular React components with TypeScript and custom hooks',
      'Manage complex application state using modern state management paradigms',
      'Integrate authenticated RESTful services and robust error boundaries',
      'Deploy and monitor production builds with Docker and Vercel/AWS'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    status: 'published',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
    modules: [
      {
        id: 'mod-4-1',
        title: 'Module 1: React 18+ Concurrent State & Hooks',
        description: 'Deep dive into rendering lifecycles, memoization with useMemo/useCallback, and clean custom hooks.',
        durationMinutes: 50,
        videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8'
      }
    ]
  }
];

// Initial Mock Assessments
export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'assess-1',
    courseId: 'course-1',
    courseTitle: 'Enterprise Java & Data Structures Architecture',
    subject: 'Data Structures & OOP',
    title: 'Object-Oriented Design & Data Structures Diagnostic',
    description: 'Verify your understanding of object models, polymorphism, memory safety, and time complexity.',
    durationMinutes: 20,
    passingScorePercent: 70,
    competencyCovered: 'Data Structures',
    status: 'published',
    createdAt: '2026-09-01T10:00:00Z',
    questions: [
      {
        id: 'q1',
        question: 'Which of the following operations takes worst-case O(1) time complexity in an ArrayList vs LinkedList in Java?',
        options: [
          'Random access by index (get(i))',
          'Insertion at the beginning (addFirst)',
          'Deletion from an arbitrary position without iterator',
          'Memory allocation per node'
        ],
        correctAnswerIndex: 0,
        explanation: 'ArrayList maintains a contiguous array in memory, allowing instant O(1) address computation via offset arithmetic.'
      },
      {
        id: 'q2',
        question: 'What is the primary principle violated if a derived class overrides a method to throw an UnsupportedOperationException?',
        options: [
          'Single Responsibility Principle (SRP)',
          'Liskov Substitution Principle (LSP)',
          'Open-Closed Principle (OCP)',
          'Dependency Inversion Principle (DIP)'
        ],
        correctAnswerIndex: 1,
        explanation: 'Liskov Substitution states that subclasses must be substitutable for their base types without altering program correctness.'
      },
      {
        id: 'q3',
        question: 'In a balanced Binary Search Tree (such as AVL or Red-Black), what is the time complexity for search, insertion, and deletion?',
        options: [
          'O(1)',
          'O(log N)',
          'O(N)',
          'O(N log N)'
        ],
        correctAnswerIndex: 1,
        explanation: 'Balancing invariants guarantee maximum tree height is strictly bounded by log2(N), ensuring O(log N) operations.'
      },
      {
        id: 'q4',
        question: 'How does HashMap resolve collisions in Java 8 and later when the number of items in a bucket exceeds 8?',
        options: [
          'It drops earlier elements',
          'It transforms the linked list into a balanced Red-Black Tree',
          'It doubles the hash table capacity immediately without bucket conversion',
          'It uses quadratic probing'
        ],
        correctAnswerIndex: 1,
        explanation: 'When a bucket reaches TREEIFY_THRESHOLD (8), it transitions from a LinkedList (O(n)) to a Red-Black Tree (O(log n)).'
      }
    ]
  },
  {
    id: 'assess-2',
    courseId: 'course-2',
    courseTitle: 'Practical Machine Learning & Statistical Analysis',
    subject: 'Machine Learning',
    title: 'Statistical Learning & ML Foundations Assessment',
    description: 'Test your grasp of variance-bias tradeoff, cost functions, and metric interpretations.',
    durationMinutes: 20,
    passingScorePercent: 70,
    competencyCovered: 'Machine Learning',
    status: 'published',
    createdAt: '2026-09-02T10:00:00Z',
    questions: [
      {
        id: 'q2-1',
        question: 'What phenomenon is indicated when a model achieves 99.5% training accuracy but only 64% validation accuracy?',
        options: [
          'High bias / Underfitting',
          'High variance / Overfitting',
          'Data leakage during validation',
          'Optimal convergence'
        ],
        correctAnswerIndex: 1,
        explanation: 'A large discrepancy between training and validation accuracy is the hallmark of overfitting (high variance).'
      },
      {
        id: 'q2-2',
        question: 'Which evaluation metric is best suited for evaluating an imbalanced fraud detection dataset where fraud occurs in 0.1% of transactions?',
        options: [
          'Overall Accuracy',
          'Precision-Recall AUC (PR-AUC)',
          'Mean Squared Error (MSE)',
          'R-Squared'
        ],
        correctAnswerIndex: 1,
        explanation: 'In highly imbalanced regimes, standard accuracy is misleading. PR-AUC prioritizes the rare positive class.'
      }
    ]
  },
  {
    id: 'assess-3',
    courseId: 'course-3',
    courseTitle: 'Advanced Relational SQL & Database Optimization',
    subject: 'Database Systems',
    title: 'Relational Schema & Query Optimization Assessment',
    description: 'Validate your proficiency in indexing, joins, execution plans, and transaction isolation levels.',
    durationMinutes: 15,
    passingScorePercent: 70,
    competencyCovered: 'SQL',
    status: 'published',
    createdAt: '2026-09-03T10:00:00Z',
    questions: [
      {
        id: 'q3-1',
        question: 'Which index type is best suited for range queries like "WHERE age BETWEEN 20 AND 30"?',
        options: [
          'Hash Index',
          'B-Tree Index',
          'Bitmap Index',
          'Full-Text Index'
        ],
        correctAnswerIndex: 1,
        explanation: 'B-Tree indexes maintain sorted keys and linked leaves, enabling efficient logarithmic range scans.'
      },
      {
        id: 'q3-2',
        question: 'What SQL clause allows calculating a running total without collapsing grouped rows?',
        options: [
          'GROUP BY WITH ROLLUP',
          'OVER (ORDER BY ...)',
          'HAVING SUM(...)',
          'CROSS APPLY'
        ],
        correctAnswerIndex: 1,
        explanation: 'The OVER() analytic clause enables window computations across rows while preserving individual row granularity.'
      }
    ]
  }
];

// Initial Mock Announcements
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Capacity Connect 2.0 Launch: Industry Mentorship Now Live',
    content: 'All trainees can now connect directly with accredited university and enterprise trainers through personalized competency matching.',
    type: 'announcement',
    audience: 'all',
    publishedBy: 'System Administrator',
    publishedAt: '2026-09-10T09:00:00Z'
  },
  {
    id: 'ann-2',
    title: 'Top Performer Spotlight: 140+ Trainees Certified in Java & Cloud Architecture',
    content: 'Congratulations to our cohort participants who successfully cleared the Enterprise Software Competency Assessment this week!',
    type: 'achievement',
    audience: 'all',
    publishedBy: 'Academic Council',
    publishedAt: '2026-09-12T14:30:00Z'
  },
  {
    id: 'ann-3',
    title: 'New Learning Content: Practical Machine Learning & Deep Neural Models',
    content: 'Dr. Rakesh Sharma has released 4 new hands-on case studies and interactive notebook exercises.',
    type: 'new_content',
    audience: 'trainees',
    publishedBy: 'Dr. Rakesh Sharma',
    publishedAt: '2026-09-13T08:00:00Z'
  }
];

// Normalized Skill Mapping & Synonyms Dictionary
export const SKILL_SYNONYMS: Record<string, string[]> = {
  'java': ['java', 'core java', 'advanced java', 'j2ee'],
  'python': ['python', 'py', 'python3', 'django', 'flask'],
  'javascript': ['javascript', 'js', 'es6', 'vanilla js', 'ecmascript'],
  'typescript': ['typescript', 'ts'],
  'react': ['react', 'react.js', 'reactjs', 'frontend react'],
  'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'database', 'rdbms'],
  'git': ['git', 'github', 'version control', 'gitlab'],
  'oop': ['oop', 'oops', 'object oriented programming', 'object-oriented programming'],
  'data structures': ['data structures', 'dsa', 'data structures and algorithms', 'algorithms'],
  'problem solving': ['problem solving', 'analytical skills', 'logic', 'critical thinking'],
  'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence', 'predictive modeling'],
  'statistics': ['statistics', 'statistical analysis', 'probability', 'math/statistics', 'data analysis'],
  'docker': ['docker', 'containerization', 'containers'],
  'rest apis': ['rest apis', 'rest api', 'apis', 'restful services', 'api design']
};

export const normalizeSkillName = (raw: string): string => {
  const clean = raw.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    if (canonical === clean || aliases.some(a => clean.includes(a) || a.includes(clean))) {
      return canonical.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return raw.trim();
};

export const isSkillEquivalent = (skillA: string, skillB: string): boolean => {
  const a = skillA.toLowerCase().trim();
  const b = skillB.toLowerCase().trim();
  if (a === b || a.includes(b) || b.includes(a)) return true;
  for (const aliases of Object.values(SKILL_SYNONYMS)) {
    const hasA = aliases.some(al => a.includes(al) || al.includes(a));
    const hasB = aliases.some(al => b.includes(al) || al.includes(b));
    if (hasA && hasB) return true;
  }
  return false;
};

// =========================================================================
// CAPACITY CONNECT STORAGE & STATE MANAGEMENT SINGLETON
// =========================================================================
class CapacityStore {
  private static STORAGE_KEY_PREFIX = 'capacity_connect_';

  // Retrieve current active role
  public getActiveRole(): UserRole {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}active_role`);
      if (stored === 'trainer' || stored === 'admin') return stored;
    } catch {}
    return 'trainee';
  }

  public setActiveRole(role: UserRole) {
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}active_role`, role);
      window.dispatchEvent(new Event('capacity_connect_role_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  // Trainee Profile
  public getTraineeProfile(userId: string): TraineeProfile {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}trainee_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}

    // Default seeded profile for current user
    const defaultProfile: TraineeProfile = {
      id: `trainee-${userId.slice(0, 8)}`,
      userId,
      name: 'Pavan Kumar',
      email: 'pavan.kumar@student.edu',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Jawaharlal Nehru Technological University',
      qualification: 'Undergraduate (3rd Year)',
      graduationYear: '2026',
      workExperience: 'Academic Projects & Competitive Programming',
      currentRole: 'Student / Aspiring Software Engineer',
      careerInterests: ['Software Engineering', 'Data Science', 'Cloud Systems'],
      learningInterests: ['Data Structures', 'Machine Learning', 'Advanced SQL', 'Docker'],
      skills: [
        { name: 'Java', level: 82, category: 'Technical' },
        { name: 'Python', level: 75, category: 'Technical' },
        { name: 'HTML/CSS', level: 80, category: 'Technical' },
        { name: 'Problem Solving', level: 78, category: 'Technical' },
        { name: 'Communication', level: 74, category: 'Soft Skills' }
      ],
      certifications: [
        { name: 'Java Programming Foundations', issuer: 'HackerRank', date: 'June 2025' }
      ],
      projects: [
        { title: 'Campus Placement Portal', description: 'Full stack portal matching students to recruiters', technologies: ['Java', 'SQL', 'HTML'] }
      ],
      careerGoals: 'Secure a high-impact Software Engineer role with strong foundations in distributed backend systems.',
      overallCompetencyScore: 78
    };

    this.saveTraineeProfile(defaultProfile);
    return defaultProfile;
  }

  public saveTraineeProfile(profile: TraineeProfile) {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}trainee_${profile.userId}`;
      localStorage.setItem(key, JSON.stringify(profile));
      window.dispatchEvent(new Event('capacity_connect_profile_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  // Update Trainee Skill Competency (e.g. after assessment)
  public updateTraineeSkill(userId: string, skillName: string, gain: number) {
    const profile = this.getTraineeProfile(userId);
    const existing = profile.skills.find(s => isSkillEquivalent(s.name, skillName));
    if (existing) {
      existing.level = Math.min(100, Math.round(existing.level + gain));
    } else {
      profile.skills.push({
        name: normalizeSkillName(skillName),
        level: Math.min(100, Math.max(50, Math.round(60 + gain))),
        category: 'Technical'
      });
    }

    // Recalculate overall score
    const total = profile.skills.reduce((sum, s) => sum + s.level, 0);
    profile.overallCompetencyScore = Math.round(total / profile.skills.length);
    this.saveTraineeProfile(profile);
  }

  // Trainers
  public getTrainers(): TrainerProfile[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}trainers`);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveTrainers(INITIAL_TRAINERS);
    return INITIAL_TRAINERS;
  }

  public saveTrainers(trainers: TrainerProfile[]) {
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}trainers`, JSON.stringify(trainers));
    } catch (e) {
      console.error(e);
    }
  }

  // Courses
  public getCourses(): Course[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}courses`);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveCourses(INITIAL_COURSES);
    return INITIAL_COURSES;
  }

  public saveCourses(courses: Course[]) {
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}courses`, JSON.stringify(courses));
      window.dispatchEvent(new Event('capacity_connect_courses_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  public addCourse(course: Course) {
    const list = this.getCourses();
    list.unshift(course);
    this.saveCourses(list);
  }

  // Enrollments
  public getEnrollments(traineeId: string): CourseEnrollment[] {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}enrollments_${traineeId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}

    // Initial default enrollment in Course 1
    const defaultEnrollments: CourseEnrollment[] = [
      {
        id: 'enroll-1',
        courseId: 'course-1',
        traineeId,
        progressPercent: 65,
        status: 'active',
        currentModuleId: 'mod-1-2',
        completedModuleIds: ['mod-1-1'],
        enrolledAt: '2026-09-02T10:00:00Z',
        lastAccessedAt: new Date().toISOString()
      }
    ];
    this.saveEnrollments(traineeId, defaultEnrollments);
    return defaultEnrollments;
  }

  public saveEnrollments(traineeId: string, enrollments: CourseEnrollment[]) {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}enrollments_${traineeId}`;
      localStorage.setItem(key, JSON.stringify(enrollments));
      window.dispatchEvent(new Event('capacity_connect_enrollments_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  public enrollInCourse(traineeId: string, courseId: string): CourseEnrollment {
    const list = this.getEnrollments(traineeId);
    const existing = list.find(e => e.courseId === courseId);
    if (existing) return existing;

    const course = this.getCourses().find(c => c.id === courseId);
    const newEnrollment: CourseEnrollment = {
      id: `enroll-${Date.now()}`,
      courseId,
      traineeId,
      progressPercent: 0,
      status: 'active',
      currentModuleId: course?.modules[0]?.id || '',
      completedModuleIds: [],
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };
    list.unshift(newEnrollment);
    this.saveEnrollments(traineeId, list);

    // Update course enrolled count
    if (course) {
      course.enrolledCount += 1;
      const courses = this.getCourses().map(c => c.id === courseId ? course : c);
      this.saveCourses(courses);
    }

    return newEnrollment;
  }

  public updateModuleProgress(traineeId: string, courseId: string, moduleId: string): CourseEnrollment | null {
    const list = this.getEnrollments(traineeId);
    const enrollment = list.find(e => e.courseId === courseId);
    const course = this.getCourses().find(c => c.id === courseId);
    if (!enrollment || !course) return null;

    if (!enrollment.completedModuleIds.includes(moduleId)) {
      enrollment.completedModuleIds.push(moduleId);
    }
    enrollment.progressPercent = Math.min(100, Math.round((enrollment.completedModuleIds.length / course.modules.length) * 100));
    enrollment.lastAccessedAt = new Date().toISOString();

    if (enrollment.progressPercent >= 100) {
      enrollment.status = 'completed';
      // Auto issue certificate if not already issued
      if (!enrollment.certificateId) {
        const cert = this.issueCertificate(traineeId, course);
        enrollment.certificateId = cert.id;
      }
    }

    this.saveEnrollments(traineeId, list);
    return enrollment;
  }

  // Assessments
  public getAssessments(): Assessment[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}assessments`);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveAssessments(INITIAL_ASSESSMENTS);
    return INITIAL_ASSESSMENTS;
  }

  public saveAssessments(assessments: Assessment[]) {
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}assessments`, JSON.stringify(assessments));
    } catch (e) {
      console.error(e);
    }
  }

  // Attempts
  public getAttempts(traineeId: string): AssessmentAttempt[] {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}attempts_${traineeId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  public recordAttempt(attempt: AssessmentAttempt) {
    const list = this.getAttempts(attempt.traineeId);
    list.unshift(attempt);
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}attempts_${attempt.traineeId}`;
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new Event('capacity_connect_attempts_changed'));
    } catch (e) {
      console.error(e);
    }

    // Dynamic competency improvement if passed
    if (attempt.isPassed && attempt.competencyUpdated) {
      this.updateTraineeSkill(attempt.traineeId, attempt.competencyUpdated, attempt.competencyGain);
    }
  }

  // Certificates
  public getCertificates(traineeId: string): Certificate[] {
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}certs_${traineeId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  public issueCertificate(traineeId: string, course: Course): Certificate {
    const list = this.getCertificates(traineeId);
    const existing = list.find(c => c.courseId === course.id);
    if (existing) return existing;

    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateCode: `CC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`,
      traineeId,
      traineeName: 'Pavan Kumar',
      courseId: course.id,
      courseTitle: course.title,
      trainerName: course.trainerName,
      issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      scorePercent: 94,
      competenciesAchieved: course.requiredCompetencies.map(r => r.name),
      verificationUrl: `https://capacityconnect.edu/verify/CC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    };

    list.unshift(cert);
    try {
      const key = `${CapacityStore.STORAGE_KEY_PREFIX}certs_${traineeId}`;
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new Event('capacity_connect_certs_changed'));
    } catch (e) {
      console.error(e);
    }
    return cert;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}announcements`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_ANNOUNCEMENTS;
  }

  public addAnnouncement(announcement: Announcement) {
    const list = this.getAnnouncements();
    list.unshift(announcement);
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}announcements`, JSON.stringify(list));
      window.dispatchEvent(new Event('capacity_connect_announcements_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  // Trainer Library Resources
  public getTrainerResources(trainerId?: string): TrainerResource[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}resources`);
      if (stored) {
        const all: TrainerResource[] = JSON.parse(stored);
        return trainerId ? all.filter(r => r.trainerId === trainerId) : all;
      }
    } catch {}

    const defaults: TrainerResource[] = [
      {
        id: 'res-1',
        trainerId: 'trainer-2',
        title: 'Java Concurrency & Memory Model Architecture.pdf',
        type: 'pdf',
        fileUrl: 'https://capacityconnect.edu/materials/java-concurrency.pdf',
        fileSizeMb: 4.2,
        subject: 'Enterprise Java',
        courseId: 'course-1',
        uploadedAt: '2026-09-02T10:00:00Z'
      },
      {
        id: 'res-2',
        trainerId: 'trainer-1',
        title: 'Applied Machine Learning Lecture 01 - Statistical Bounds.mp4',
        type: 'lecture_video',
        fileUrl: 'https://capacityconnect.edu/lectures/ml-01.mp4',
        fileSizeMb: 145.0,
        subject: 'Machine Learning',
        courseId: 'course-2',
        uploadedAt: '2026-09-04T12:00:00Z'
      },
      {
        id: 'res-3',
        trainerId: 'trainer-3',
        title: 'React 18 Concurrent Architecture Masterclass Slides.pptx',
        type: 'presentation',
        fileUrl: 'https://capacityconnect.edu/slides/react18.pptx',
        fileSizeMb: 12.8,
        subject: 'Frontend Architecture',
        courseId: 'course-4',
        uploadedAt: '2026-09-07T16:00:00Z'
      }
    ];
    this.saveTrainerResources(defaults);
    return trainerId ? defaults.filter(r => r.trainerId === trainerId) : defaults;
  }

  public saveTrainerResources(resources: TrainerResource[]) {
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}resources`, JSON.stringify(resources));
      window.dispatchEvent(new Event('capacity_connect_resources_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  public addTrainerResource(resource: TrainerResource) {
    const list = this.getTrainerResources();
    list.unshift(resource);
    this.saveTrainerResources(list);
  }

  // Course Feedback
  public getFeedback(courseId?: string): CourseFeedback[] {
    try {
      const stored = localStorage.getItem(`${CapacityStore.STORAGE_KEY_PREFIX}feedback`);
      if (stored) {
        const all: CourseFeedback[] = JSON.parse(stored);
        return courseId ? all.filter(f => f.courseId === courseId) : all;
      }
    } catch {}

    const defaults: CourseFeedback[] = [
      {
        id: 'fb-1',
        courseId: 'course-1',
        traineeId: 'user-trainee-1',
        traineeName: 'Pavan Kumar',
        courseRating: 5,
        trainerRating: 5,
        contentRating: 5,
        feedbackText: 'Priya Narayanan explains complex JVM memory and tree algorithms with extraordinary clarity. The practical assignments directly helped me crack technical interview rounds.',
        submittedAt: '2026-09-08T11:00:00Z'
      }
    ];
    return defaults;
  }

  public submitFeedback(feedback: CourseFeedback) {
    const list = this.getFeedback();
    list.unshift(feedback);
    try {
      localStorage.setItem(`${CapacityStore.STORAGE_KEY_PREFIX}feedback`, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  // =========================================================================
  // COMPETENCY ENGINE & TRAINER MATCHING ALGORITHM
  // =========================================================================
  public calculateCompetencyGaps(
    traineeSkills: { name: string; level: number }[],
    targetRoleOrCourse: string = 'Software Engineer'
  ): {
    overallMatchPercent: number;
    competencyList: CompetencyItem[];
    topGaps: CompetencyItem[];
  } {
    // Benchmark requirement profiles
    const benchmarkRequirements: Record<string, { skill: string; category: 'Technical' | 'Domain' | 'Soft Skills' | 'Tools'; requiredLevel: number }[]> = {
      'Software Engineer': [
        { skill: 'Java', category: 'Technical', requiredLevel: 80 },
        { skill: 'Data Structures', category: 'Technical', requiredLevel: 75 },
        { skill: 'OOP', category: 'Technical', requiredLevel: 75 },
        { skill: 'SQL', category: 'Technical', requiredLevel: 70 },
        { skill: 'Git', category: 'Tools', requiredLevel: 65 },
        { skill: 'Problem Solving', category: 'Technical', requiredLevel: 75 },
        { skill: 'Communication', category: 'Soft Skills', requiredLevel: 70 }
      ],
      'Data Scientist': [
        { skill: 'Python', category: 'Technical', requiredLevel: 85 },
        { skill: 'Machine Learning', category: 'Technical', requiredLevel: 75 },
        { skill: 'Statistics', category: 'Domain', requiredLevel: 75 },
        { skill: 'SQL', category: 'Technical', requiredLevel: 70 },
        { skill: 'Data Structures', category: 'Technical', requiredLevel: 65 }
      ]
    };

    const requirements = benchmarkRequirements[targetRoleOrCourse] || benchmarkRequirements['Software Engineer'];
    const courses = this.getCourses();
    const trainers = this.getTrainers();

    const competencyList: CompetencyItem[] = requirements.map(req => {
      const match = traineeSkills.find(s => isSkillEquivalent(s.name, req.skill));
      const currentLevel = match ? match.level : 0;
      const gap = Math.max(0, req.requiredLevel - currentLevel);
      const priority: 'High' | 'Medium' | 'Low' = gap >= 35 ? 'High' : gap >= 15 ? 'Medium' : 'Low';

      // Find best course closing this gap
      const matchedCourse = courses.find(c => 
        c.requiredCompetencies.some(rc => isSkillEquivalent(rc.name, req.skill)) ||
        c.subject.toLowerCase().includes(req.skill.toLowerCase()) ||
        c.title.toLowerCase().includes(req.skill.toLowerCase())
      );

      // Find best trainer
      const matchedTrainer = trainers.find(t =>
        t.competencies.some(comp => isSkillEquivalent(comp.name, req.skill)) ||
        t.subjects.some(subj => isSkillEquivalent(subj, req.skill))
      );

      return {
        id: `comp-${req.skill.toLowerCase().replace(/\s+/g, '-')}`,
        name: req.skill,
        category: req.category,
        currentLevel,
        requiredLevel: req.requiredLevel,
        gap,
        priority,
        recommendedCourseId: matchedCourse?.id,
        recommendedCourseTitle: matchedCourse?.title,
        suitableTrainerId: matchedTrainer?.id,
        suitableTrainerName: matchedTrainer?.name
      };
    });

    const totalRequired = competencyList.reduce((sum, c) => sum + c.requiredLevel, 0);
    const totalCurrent = competencyList.reduce((sum, c) => sum + Math.min(c.currentLevel, c.requiredLevel), 0);
    const overallMatchPercent = Math.round((totalCurrent / totalRequired) * 100);

    const topGaps = competencyList
      .filter(c => c.gap > 0)
      .sort((a, b) => b.gap - a.gap);

    return {
      overallMatchPercent,
      competencyList,
      topGaps
    };
  }

  // Multi-factor Trainer Matching Algorithm
  public matchTrainersForSkillGap(gapSkill: string): { trainer: TrainerProfile; matchScore: number; matchReasons: string[] }[] {
    const trainers = this.getTrainers();
    return trainers.map(trainer => {
      let score = 50;
      const reasons: string[] = [];

      // 1. Competency Proficiency Match
      const comp = trainer.competencies.find(c => isSkillEquivalent(c.name, gapSkill));
      if (comp) {
        score += Math.round(comp.proficiency * 0.3);
        reasons.push(`${trainer.name} has ${comp.proficiency}% verified proficiency in ${comp.name}.`);
      }

      // 2. Subject relevance
      if (trainer.subjects.some(s => isSkillEquivalent(s, gapSkill))) {
        score += 10;
        reasons.push(`Actively leads accredited curriculum in ${gapSkill}.`);
      }

      // 3. Experience & Rating
      if (trainer.yearsOfExperience >= 5) {
        score += 5;
        reasons.push(`${trainer.yearsOfExperience}+ years of enterprise & academic instructional experience.`);
      }
      if (trainer.rating >= 4.8) {
        score += 5;
        reasons.push(`Maintains top student satisfaction rating of ${trainer.rating}/5.0.`);
      }

      return {
        trainer,
        matchScore: Math.min(98, score),
        matchReasons: reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  // Mentorship Sessions Storage
  public getMentorshipSessions(userId?: string, trainerId?: string): MentorshipSession[] {
    const raw = localStorage.getItem('cc_mentorship_sessions');
    let sessions: MentorshipSession[] = raw ? JSON.parse(raw) : [
      {
        id: 'session-1',
        traineeId: 'guest',
        traineeName: 'Shyam Sundar',
        trainerId: 'trainer-2',
        trainerName: 'Priya Narayanan',
        skillGap: 'Data Structures & OOP',
        scheduledDate: 'Tomorrow',
        timeSlot: '04:00 PM - 04:45 PM',
        status: 'confirmed',
        notes: 'Review binary search tree rebalancing and recursive depth-first traversals.',
        meetingLink: 'https://meet.google.com/capacity-remedial-session',
        bookedAt: new Date().toISOString()
      },
      {
        id: 'session-2',
        traineeId: 'trainee-102',
        traineeName: 'Aarav Mehta',
        trainerId: 'trainer-2',
        trainerName: 'Priya Narayanan',
        skillGap: 'Advanced SQL Query Optimization',
        scheduledDate: 'Friday',
        timeSlot: '02:30 PM - 03:15 PM',
        status: 'pending',
        notes: 'Query execution plans and non-clustered index scanning.',
        meetingLink: 'https://meet.google.com/capacity-sql-remedial',
        bookedAt: new Date().toISOString()
      }
    ];

    if (trainerId) {
      sessions = sessions.filter(s => s.trainerId === trainerId);
    } else if (userId) {
      sessions = sessions.filter(s => s.traineeId === userId);
    }

    return sessions;
  }

  public bookMentorshipSession(data: Omit<MentorshipSession, 'id' | 'bookedAt'>): MentorshipSession {
    const existing = this.getMentorshipSessions();
    const newSession: MentorshipSession = {
      ...data,
      id: `session-${Date.now()}`,
      bookedAt: new Date().toISOString(),
      meetingLink: `https://meet.google.com/capacity-${Math.random().toString(36).substring(7)}`
    };
    const updated = [newSession, ...existing];
    localStorage.setItem('cc_mentorship_sessions', JSON.stringify(updated));
    window.dispatchEvent(new Event('capacity_connect_mentorship_changed'));
    return newSession;
  }

  public updateMentorshipStatus(sessionId: string, status: MentorshipSession['status']): void {
    const existing = this.getMentorshipSessions();
    const updated = existing.map(s => s.id === sessionId ? { ...s, status } : s);
    localStorage.setItem('cc_mentorship_sessions', JSON.stringify(updated));
    window.dispatchEvent(new Event('capacity_connect_mentorship_changed'));
  }

  // Cohort Skill Gap Demands (For Trainer Radar)
  public getSkillGapDemands(): SkillGapDemand[] {
    return [
      {
        id: 'demand-1',
        skillName: 'Data Structures & Algorithmic Complexity',
        category: 'Core Computer Science',
        traineeCount: 48,
        averageGapPercent: 38,
        urgency: 'Critical',
        topCourseRecommendation: 'Enterprise Java & Data Structures Architecture'
      },
      {
        id: 'demand-2',
        skillName: 'Enterprise OOP & Modular Clean Architecture',
        category: 'Software Design',
        traineeCount: 36,
        averageGapPercent: 32,
        urgency: 'Critical',
        topCourseRecommendation: 'Enterprise Java & Data Structures Architecture'
      },
      {
        id: 'demand-3',
        skillName: 'Advanced Relational SQL & Indexing Strategies',
        category: 'Databases',
        traineeCount: 29,
        averageGapPercent: 26,
        urgency: 'Moderate',
        topCourseRecommendation: 'Advanced Relational SQL & Database Optimization'
      },
      {
        id: 'demand-4',
        skillName: 'Production Cloud CI/CD & Docker Orchestration',
        category: 'Cloud Systems',
        traineeCount: 22,
        averageGapPercent: 30,
        urgency: 'Moderate',
        topCourseRecommendation: 'Modern Full-Stack React & Cloud Architecture'
      },
      {
        id: 'demand-5',
        skillName: 'Python Machine Learning & Statistical Inference',
        category: 'Data Science & AI',
        traineeCount: 41,
        averageGapPercent: 35,
        urgency: 'Critical',
        topCourseRecommendation: 'Applied Machine Learning & Deep Learning Foundations'
      }
    ];
  }

  // Trainer Live Workshops
  public getWorkshops(trainerId?: string): TrainerWorkshop[] {
    const raw = localStorage.getItem('cc_workshops');
    let workshops: TrainerWorkshop[] = raw ? JSON.parse(raw) : [
      {
        id: 'ws-1',
        trainerId: 'trainer-2',
        trainerName: 'Priya Narayanan',
        title: 'Live Rapid Bootcamp: Cracking Tree & Graph Algorithms',
        targetSkillGap: 'Data Structures',
        date: 'This Saturday, Sept 20',
        time: '11:00 AM - 01:00 PM IST',
        registeredCount: 34,
        maxSeats: 50,
        meetUrl: 'https://meet.google.com/capacity-ws-trees'
      },
      {
        id: 'ws-2',
        trainerId: 'trainer-2',
        trainerName: 'Priya Narayanan',
        title: 'Interactive Query Plan Clinic: SQL Index Optimization',
        targetSkillGap: 'SQL & Databases',
        date: 'Next Tuesday, Sept 23',
        time: '06:00 PM - 07:30 PM IST',
        registeredCount: 22,
        maxSeats: 40,
        meetUrl: 'https://meet.google.com/capacity-ws-sql'
      }
    ];

    if (trainerId) {
      workshops = workshops.filter(w => w.trainerId === trainerId);
    }
    return workshops;
  }

  public createWorkshop(data: Omit<TrainerWorkshop, 'id' | 'registeredCount'>): TrainerWorkshop {
    const existing = this.getWorkshops();
    const newWs: TrainerWorkshop = {
      ...data,
      id: `ws-${Date.now()}`,
      registeredCount: 1
    };
    const updated = [newWs, ...existing];
    localStorage.setItem('cc_workshops', JSON.stringify(updated));
    window.dispatchEvent(new Event('capacity_connect_workshops_changed'));
    return newWs;
  }

  // Jobs Pipeline & Placement Intelligence
  public getJobs(): JobOpportunity[] {
    const raw = localStorage.getItem('cc_jobs');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* ignore */ }
    }
    const defaultJobs: JobOpportunity[] = [
      {
        id: 'job-1',
        title: 'Full Stack Cloud Engineer',
        company: 'Google Cloud Platform',
        location: 'Hyderabad / Bangalore',
        ctcPackage: '18 - 28 LPA',
        type: 'Full-time',
        requiredSkills: ['Java', 'Data Structures', 'Cloud & DevOps', 'REST APIs'],
        minEligibilityScore: 75,
        openings: 12,
        applicantsCount: 148,
        shortlistedCount: 32,
        status: 'active',
        postedDate: 'Sept 04, 2026'
      },
      {
        id: 'job-2',
        title: 'Applied AI & ML Specialist',
        company: 'Microsoft IDC',
        location: 'Hyderabad / Hybrid',
        ctcPackage: '22 - 34 LPA',
        type: 'Full-time',
        requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics'],
        minEligibilityScore: 80,
        openings: 6,
        applicantsCount: 94,
        shortlistedCount: 18,
        status: 'active',
        postedDate: 'Sept 08, 2026'
      },
      {
        id: 'job-3',
        title: 'Distributed Backend Developer',
        company: 'Amazon Web Services (AWS)',
        location: 'Bangalore, KA',
        ctcPackage: '20 - 32 LPA',
        type: 'Full-time',
        requiredSkills: ['Java', 'SQL', 'OOP', 'System Design'],
        minEligibilityScore: 78,
        openings: 15,
        applicantsCount: 210,
        shortlistedCount: 45,
        status: 'active',
        postedDate: 'Aug 28, 2026'
      },
      {
        id: 'job-4',
        title: 'Systems & Microservices Engineer',
        company: 'Swiggy Tech',
        location: 'Remote / Bangalore',
        ctcPackage: '14 - 20 LPA',
        type: 'Hybrid',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
        minEligibilityScore: 70,
        openings: 8,
        applicantsCount: 130,
        shortlistedCount: 28,
        status: 'active',
        postedDate: 'Sept 10, 2026'
      },
      {
        id: 'job-5',
        title: 'Digital Systems Engineer (Cadre)',
        company: 'Tata Consultancy Services',
        location: 'Pan-India',
        ctcPackage: '7 - 11 LPA',
        type: 'Full-time',
        requiredSkills: ['Problem Solving', 'Java', 'SQL', 'Communication'],
        minEligibilityScore: 65,
        openings: 50,
        applicantsCount: 380,
        shortlistedCount: 112,
        status: 'active',
        postedDate: 'Sept 01, 2026'
      }
    ];
    localStorage.setItem('cc_jobs', JSON.stringify(defaultJobs));
    return defaultJobs;
  }

  public addJob(job: Omit<JobOpportunity, 'id' | 'applicantsCount' | 'shortlistedCount' | 'postedDate'>): JobOpportunity {
    const existing = this.getJobs();
    const newJob: JobOpportunity = {
      ...job,
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      shortlistedCount: 0,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    const updated = [newJob, ...existing];
    localStorage.setItem('cc_jobs', JSON.stringify(updated));
    window.dispatchEvent(new Event('capacity_connect_jobs_changed'));
    return newJob;
  }

  // Internships Hub
  public getInternships(): InternshipOpportunity[] {
    const raw = localStorage.getItem('cc_internships');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* ignore */ }
    }
    const defaultInternships: InternshipOpportunity[] = [
      {
        id: 'intern-1',
        title: 'AI & Data Science Engineering Intern',
        company: 'Razorpay',
        location: 'Bangalore / Hybrid',
        stipend: '₹45,000 / mo',
        duration: '6 Months',
        ppoOpportunity: true,
        eligibleYears: ['3rd Year', 'Final Year'],
        requiredSkills: ['Python', 'SQL', 'Machine Learning'],
        applicantsCount: 88,
        openings: 8,
        status: 'active',
        deadline: 'Oct 15, 2026'
      },
      {
        id: 'intern-2',
        title: 'Cloud Infrastructure & SRE Intern',
        company: 'Oracle Cloud Infrastructure (OCI)',
        location: 'Hyderabad, TS',
        stipend: '₹50,000 / mo',
        duration: '6 Months',
        ppoOpportunity: true,
        eligibleYears: ['Final Year', '3rd Year'],
        requiredSkills: ['Linux', 'Java', 'Cloud & DevOps', 'Networking'],
        applicantsCount: 114,
        openings: 10,
        status: 'active',
        deadline: 'Oct 20, 2026'
      },
      {
        id: 'intern-3',
        title: 'Applied ML Research Fellowship',
        company: 'IBM Research India',
        location: 'Bangalore / Remote',
        stipend: '₹40,000 / mo',
        duration: '3 Months',
        ppoOpportunity: true,
        eligibleYears: ['2nd Year', '3rd Year', 'Final Year'],
        requiredSkills: ['Python', 'Statistics', 'NLP'],
        applicantsCount: 72,
        openings: 5,
        status: 'active',
        deadline: 'Sept 30, 2026'
      },
      {
        id: 'intern-4',
        title: 'Frontend Experience Engineering Intern',
        company: 'Zerodha Fintech',
        location: 'Bangalore, KA',
        stipend: '₹35,000 / mo',
        duration: '6 Months',
        ppoOpportunity: true,
        eligibleYears: ['2nd Year', '3rd Year'],
        requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Web Performance'],
        applicantsCount: 96,
        openings: 4,
        status: 'active',
        deadline: 'Oct 05, 2026'
      },
      {
        id: 'intern-5',
        title: 'AICTE Smart Cities IoT & Embedded Intern',
        company: 'Cisco Innovation Labs',
        location: 'Remote',
        stipend: '₹30,000 / mo',
        duration: '4 Months',
        ppoOpportunity: false,
        eligibleYears: ['1st Year', '2nd Year', '3rd Year'],
        requiredSkills: ['C++', 'Python', 'Computer Networks'],
        applicantsCount: 142,
        openings: 20,
        status: 'active',
        deadline: 'Oct 25, 2026'
      }
    ];
    localStorage.setItem('cc_internships', JSON.stringify(defaultInternships));
    return defaultInternships;
  }

  public addInternship(data: Omit<InternshipOpportunity, 'id' | 'applicantsCount'>): InternshipOpportunity {
    const existing = this.getInternships();
    const newIntern: InternshipOpportunity = {
      ...data,
      id: `intern-${Date.now()}`,
      applicantsCount: 0
    };
    const updated = [newIntern, ...existing];
    localStorage.setItem('cc_internships', JSON.stringify(updated));
    window.dispatchEvent(new Event('capacity_connect_internships_changed'));
    return newIntern;
  }

  // Student Cohort Intelligence & Gaps Matrix
  public getStudentCohorts(): StudentCohortRecord[] {
    return [
      {
        id: 'sc-1',
        name: 'Pavan Kalyan Varma',
        email: 'pavan.k@jntu.edu',
        college: 'JNTU College of Engineering',
        degree: 'B.Tech Computer Science',
        yearOfStudy: '4th Year',
        verifiedSkillsCount: 6,
        diagnosedGaps: ['Data Structures (Advanced)', 'System Design'],
        readinessScore: 78,
        assignedTrainer: 'Priya Narayanan',
        status: 'active'
      },
      {
        id: 'sc-2',
        name: 'Neha Chawla',
        email: 'neha.chawla@annauniv.edu',
        college: 'College of Engineering Guindy (Anna Univ)',
        degree: 'B.Tech Information Technology',
        yearOfStudy: '3rd Year',
        verifiedSkillsCount: 5,
        diagnosedGaps: ['Python ML Foundations', 'Deep Learning'],
        readinessScore: 72,
        assignedTrainer: 'Dr. Rakesh Sharma',
        status: 'needs_remediation'
      },
      {
        id: 'sc-3',
        name: 'Karthik Raja',
        email: 'karthik.raja@vtu.ac.in',
        college: 'BMS College of Engineering (VTU)',
        degree: 'B.Tech Computer Science & Engg',
        yearOfStudy: '4th Year',
        verifiedSkillsCount: 8,
        diagnosedGaps: ['PostgreSQL Indexing'],
        readinessScore: 91,
        assignedTrainer: 'Priya Narayanan',
        status: 'placed'
      },
      {
        id: 'sc-4',
        name: 'Ananya Deshmukh',
        email: 'ananya.d@coep.ac.in',
        college: 'COEP Technological University',
        degree: 'B.Tech Artificial Intelligence & DS',
        yearOfStudy: '2nd Year',
        verifiedSkillsCount: 4,
        diagnosedGaps: ['Algorithms Complexity', 'Object Oriented Programming'],
        readinessScore: 64,
        assignedTrainer: 'Priya Narayanan',
        status: 'needs_remediation'
      },
      {
        id: 'sc-5',
        name: 'Rohit Balaji',
        email: 'rohit.b@nitk.edu',
        college: 'NIT Surathkal',
        degree: 'B.Tech Electrical & Computer',
        yearOfStudy: '3rd Year',
        verifiedSkillsCount: 7,
        diagnosedGaps: ['Cloud & Distributed Microservices'],
        readinessScore: 84,
        assignedTrainer: 'Priya Narayanan',
        status: 'active'
      },
      {
        id: 'sc-6',
        name: 'Sneha Patel',
        email: 'sneha.p@iitd.ac.in',
        college: 'IIT Delhi',
        degree: 'Dual Degree (B.Tech + M.Tech) CS',
        yearOfStudy: 'Final Year',
        verifiedSkillsCount: 9,
        diagnosedGaps: [],
        readinessScore: 96,
        assignedTrainer: 'Dr. Rakesh Sharma',
        status: 'placed'
      }
    ];
  }
}

export const capacityStore = new CapacityStore();
