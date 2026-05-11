import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/User';
import { Project } from './models/Project';
import { Task } from './models/Task';
import { Review } from './models/Review';
import { Notification } from './models/Notification';
import { AuditLog } from './models/AuditLog';
import { Transaction } from './models/Transaction';
import { env } from './config/env';

const MONGO_URI = env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // ============ USERS (25) ============
  const usersData = [
    // Admins (2)
    { firstName: 'Gibson', lastName: 'Bett', email: 'gibubett@gmail.com', phone: '0712345678', role: 'admin', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 0, pendingBalance: 0 },
    { firstName: 'Jane', lastName: 'Muthoni', email: 'jane.admin@hiveai.co.ke', phone: '0723456789', role: 'admin', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 0, pendingBalance: 0 },
    // Clients (5)
    { firstName: 'David', lastName: 'Kamau', email: 'david.kamau@techcorp.co.ke', phone: '0734567890', role: 'client', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 50000, pendingBalance: 0 },
    { firstName: 'Sarah', lastName: 'Otieno', email: 'sarah.otieno@dataco.co.ke', phone: '0745678901', role: 'client', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 120000, pendingBalance: 0 },
    { firstName: 'Peter', lastName: 'Njuguna', email: 'peter.njuguna@ailab.co.ke', phone: '0756789012', role: 'client', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 75000, pendingBalance: 0 },
    { firstName: 'Lucy', lastName: 'Wambui', email: 'lucy.wambui@mlstudio.co.ke', phone: '0767890123', role: 'client', status: 'active', kycStatus: 'pending', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 30000, pendingBalance: 0 },
    { firstName: 'James', lastName: 'Kipchoge', email: 'james.kipchoge@nlpworks.co.ke', phone: '0778901234', role: 'client', status: 'active', kycStatus: 'verified', emailVerified: true, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 95000, pendingBalance: 0 },
    // Workers (12)
    { firstName: 'Mary', lastName: 'Akinyi', email: 'mary.akinyi@gmail.com', phone: '0789012345', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['image_annotation', 'text_classification'], accuracyScore: 92, trustScore: 95, walletBalance: 4500, pendingBalance: 500 },
    { firstName: 'John', lastName: 'Odhiambo', email: 'john.odhiambo@gmail.com', phone: '0790123456', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['rlhf_comparison', 'ai_evaluation'], accuracyScore: 88, trustScore: 90, walletBalance: 3200, pendingBalance: 0 },
    { firstName: 'Grace', lastName: 'Chebet', email: 'grace.chebet@gmail.com', phone: '0701234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['audio_transcription', 'text_classification'], accuracyScore: 95, trustScore: 98, walletBalance: 7800, pendingBalance: 1000 },
    { firstName: 'Brian', lastName: 'Mwangi', email: 'brian.mwangi@gmail.com', phone: '0711234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['image_annotation', 'video_annotation'], accuracyScore: 85, trustScore: 87, walletBalance: 2100, pendingBalance: 0 },
    { firstName: 'Faith', lastName: 'Wanjiku', email: 'faith.wanjiku@gmail.com', phone: '0721234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['text_classification', 'rlhf_comparison'], accuracyScore: 90, trustScore: 92, walletBalance: 5600, pendingBalance: 200 },
    { firstName: 'Kevin', lastName: 'Kiprono', email: 'kevin.kiprono@gmail.com', phone: '0731234567', role: 'worker', status: 'active', kycStatus: 'pending', emailVerified: true, skills: ['image_annotation'], accuracyScore: 78, trustScore: 80, walletBalance: 1500, pendingBalance: 0 },
    { firstName: 'Agnes', lastName: 'Nekesa', email: 'agnes.nekesa@gmail.com', phone: '0741234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['audio_transcription', 'video_annotation'], accuracyScore: 91, trustScore: 94, walletBalance: 6300, pendingBalance: 0 },
    { firstName: 'Dennis', lastName: 'Rotich', email: 'dennis.rotich@gmail.com', phone: '0751234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['ai_evaluation', 'rlhf_comparison'], accuracyScore: 87, trustScore: 89, walletBalance: 4100, pendingBalance: 500 },
    { firstName: 'Esther', lastName: 'Jepkorir', email: 'esther.jepkorir@gmail.com', phone: '0761234567', role: 'worker', status: 'suspended', kycStatus: 'rejected', emailVerified: true, skills: ['text_classification'], accuracyScore: 55, trustScore: 40, walletBalance: 800, pendingBalance: 0 },
    { firstName: 'Victor', lastName: 'Wafula', email: 'victor.wafula@gmail.com', phone: '0771234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['image_annotation', 'text_classification', 'ai_evaluation'], accuracyScore: 93, trustScore: 96, walletBalance: 9200, pendingBalance: 0 },
    { firstName: 'Christine', lastName: 'Auma', email: 'christine.auma@gmail.com', phone: '0781234567', role: 'worker', status: 'active', kycStatus: 'not_started', emailVerified: false, skills: [], accuracyScore: 100, trustScore: 100, walletBalance: 0, pendingBalance: 0 },
    { firstName: 'Moses', lastName: 'Kiptoo', email: 'moses.kiptoo@gmail.com', phone: '0791234567', role: 'worker', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['video_annotation', 'image_annotation'], accuracyScore: 89, trustScore: 91, walletBalance: 3700, pendingBalance: 300 },
    // Reviewers (4)
    { firstName: 'Angela', lastName: 'Moraa', email: 'angela.moraa@hiveai.co.ke', phone: '0702345678', role: 'reviewer', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['image_annotation', 'text_classification', 'rlhf_comparison'], accuracyScore: 97, trustScore: 99, walletBalance: 12000, pendingBalance: 0 },
    { firstName: 'Samuel', lastName: 'Maina', email: 'samuel.maina@hiveai.co.ke', phone: '0713456789', role: 'reviewer', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['audio_transcription', 'video_annotation', 'ai_evaluation'], accuracyScore: 95, trustScore: 97, walletBalance: 8500, pendingBalance: 0 },
    { firstName: 'Priscilla', lastName: 'Nyambura', email: 'priscilla.nyambura@hiveai.co.ke', phone: '0724567890', role: 'reviewer', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['text_classification', 'rlhf_comparison', 'ai_evaluation'], accuracyScore: 96, trustScore: 98, walletBalance: 10200, pendingBalance: 0 },
    { firstName: 'Daniel', lastName: 'Omondi', email: 'daniel.omondi@hiveai.co.ke', phone: '0735678901', role: 'reviewer', status: 'active', kycStatus: 'verified', emailVerified: true, skills: ['image_annotation', 'video_annotation'], accuracyScore: 94, trustScore: 96, walletBalance: 7600, pendingBalance: 0 },
  ];

  const users = await User.insertMany(
    usersData.map((u) => ({ ...u, passwordHash, lastLogin: new Date() }))
  );
  console.log(`Seeded ${users.length} users`);

  // Map users by role for easy reference
  const admins = users.filter((u) => u.role === 'admin');
  const clients = users.filter((u) => u.role === 'client');
  const workers = users.filter((u) => u.role === 'worker');
  const reviewers = users.filter((u) => u.role === 'reviewer');

  // ============ PROJECTS (20) ============
  const projectsData = [
    { title: 'Kenya Wildlife Image Labels', description: 'Annotate images of wildlife in Kenyan national parks for conservation ML model training. Label animals, vegetation, and terrain types.', clientId: clients[0]._id, taskType: 'image_annotation', status: 'active', budget: 50000, payoutPerTask: 25, qualityThreshold: 85, totalTasks: 200, completedTasks: 45 },
    { title: 'Swahili Sentiment Analysis', description: 'Classify Swahili social media posts by sentiment: positive, negative, or neutral. Helps build NLP models for East African languages.', clientId: clients[0]._id, taskType: 'text_classification', status: 'active', budget: 30000, payoutPerTask: 15, qualityThreshold: 80, totalTasks: 300, completedTasks: 120 },
    { title: 'Nairobi Traffic CCTV Annotation', description: 'Annotate vehicles, pedestrians, and road features in Nairobi traffic camera footage for autonomous driving research.', clientId: clients[1]._id, taskType: 'video_annotation', status: 'active', budget: 80000, payoutPerTask: 40, qualityThreshold: 90, totalTasks: 150, completedTasks: 30 },
    { title: 'Kenyan News Article Classification', description: 'Categorize Kenyan news articles into topics: politics, business, sports, entertainment, technology, health.', clientId: clients[1]._id, taskType: 'text_classification', status: 'active', budget: 25000, payoutPerTask: 12, qualityThreshold: 75, totalTasks: 400, completedTasks: 200 },
    { title: 'AI Chatbot Response Ranking', description: 'Compare pairs of AI chatbot responses and rank which is more helpful, accurate, and natural-sounding.', clientId: clients[2]._id, taskType: 'rlhf_comparison', status: 'active', budget: 60000, payoutPerTask: 30, qualityThreshold: 85, totalTasks: 250, completedTasks: 80 },
    { title: 'Kikuyu Audio Transcription', description: 'Transcribe audio recordings in Kikuyu language for speech recognition model training.', clientId: clients[2]._id, taskType: 'audio_transcription', status: 'active', budget: 45000, payoutPerTask: 35, qualityThreshold: 90, totalTasks: 180, completedTasks: 55 },
    { title: 'E-commerce Product Tagging', description: 'Tag and classify product images from Kenyan e-commerce platforms with attributes like category, color, and condition.', clientId: clients[3]._id, taskType: 'image_annotation', status: 'active', budget: 35000, payoutPerTask: 20, qualityThreshold: 80, totalTasks: 350, completedTasks: 100 },
    { title: 'Medical Report Analysis', description: 'Evaluate AI-generated summaries of anonymized medical reports for accuracy and completeness.', clientId: clients[3]._id, taskType: 'ai_evaluation', status: 'draft', budget: 100000, payoutPerTask: 50, qualityThreshold: 95, totalTasks: 100, completedTasks: 0 },
    { title: 'Luo Language Text Classification', description: 'Classify Luo language text data for building a multilingual NLP dataset covering Kenyan languages.', clientId: clients[4]._id, taskType: 'text_classification', status: 'active', budget: 20000, payoutPerTask: 10, qualityThreshold: 75, totalTasks: 500, completedTasks: 150 },
    { title: 'Satellite Farm Image Segmentation', description: 'Segment satellite images of Kenyan farmlands to identify crop types, irrigation, and land use patterns.', clientId: clients[4]._id, taskType: 'image_annotation', status: 'active', budget: 70000, payoutPerTask: 45, qualityThreshold: 90, totalTasks: 120, completedTasks: 25 },
    { title: 'Customer Support Bot Evaluation', description: 'Rate AI customer support bot responses on helpfulness, tone, and accuracy for a Kenyan fintech.', clientId: clients[0]._id, taskType: 'ai_evaluation', status: 'active', budget: 40000, payoutPerTask: 20, qualityThreshold: 80, totalTasks: 200, completedTasks: 60 },
    { title: 'Podcast Transcription - Kenyan Tech', description: 'Transcribe episodes of popular Kenyan tech podcasts for searchable archives and accessibility.', clientId: clients[1]._id, taskType: 'audio_transcription', status: 'paused', budget: 55000, payoutPerTask: 30, qualityThreshold: 85, totalTasks: 160, completedTasks: 40 },
    { title: 'Matatu Route Video Analysis', description: 'Annotate matatu dashcam videos with route landmarks, stops, and traffic conditions.', clientId: clients[2]._id, taskType: 'video_annotation', status: 'active', budget: 65000, payoutPerTask: 35, qualityThreshold: 85, totalTasks: 140, completedTasks: 20 },
    { title: 'Swahili-English Translation QA', description: 'Evaluate quality of AI-generated Swahili to English translations, scoring fluency and accuracy.', clientId: clients[3]._id, taskType: 'rlhf_comparison', status: 'active', budget: 30000, payoutPerTask: 20, qualityThreshold: 80, totalTasks: 200, completedTasks: 70 },
    { title: 'Land Title Document OCR Verification', description: 'Verify OCR outputs of scanned Kenyan land title documents against original images.', clientId: clients[4]._id, taskType: 'text_classification', status: 'completed', budget: 15000, payoutPerTask: 10, qualityThreshold: 90, totalTasks: 200, completedTasks: 200 },
    { title: 'Kenyan Sign Language Video Labels', description: 'Label video clips of Kenyan Sign Language for gesture recognition AI model development.', clientId: clients[0]._id, taskType: 'video_annotation', status: 'active', budget: 90000, payoutPerTask: 50, qualityThreshold: 90, totalTasks: 100, completedTasks: 10 },
    { title: 'Agricultural Pest Detection', description: 'Annotate images of crop pests and diseases from Kenyan farms for pest detection AI.', clientId: clients[1]._id, taskType: 'image_annotation', status: 'active', budget: 40000, payoutPerTask: 25, qualityThreshold: 85, totalTasks: 250, completedTasks: 90 },
    { title: 'Code Review AI Evaluation', description: 'Evaluate AI-generated code review comments for relevance, correctness, and helpfulness.', clientId: clients[2]._id, taskType: 'ai_evaluation', status: 'active', budget: 55000, payoutPerTask: 30, qualityThreshold: 85, totalTasks: 180, completedTasks: 40 },
    { title: 'Kalenjin Speech Dataset', description: 'Transcribe Kalenjin language audio clips for building inclusive speech recognition models.', clientId: clients[4]._id, taskType: 'audio_transcription', status: 'active', budget: 35000, payoutPerTask: 25, qualityThreshold: 85, totalTasks: 200, completedTasks: 30 },
    { title: 'LLM Safety Response Comparison', description: 'Compare pairs of LLM responses on safety-sensitive topics, ranking which response is safer and more responsible.', clientId: clients[3]._id, taskType: 'rlhf_comparison', status: 'active', budget: 75000, payoutPerTask: 40, qualityThreshold: 90, totalTasks: 200, completedTasks: 50 },
  ];

  const projects = await Project.insertMany(projectsData);
  console.log(`Seeded ${projects.length} projects`);

  // ============ TASKS (60 - 3 per project for variety) ============
  const taskStatuses = ['pending', 'assigned', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'];
  const tasksData: any[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const taskCount = 3; // 3 tasks per project = 60 total

    for (let j = 0; j < taskCount; j++) {
      const statusIdx = (i * taskCount + j) % taskStatuses.length;
      const status = taskStatuses[statusIdx];
      const needsWorker = ['assigned', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'].includes(status);
      const workerIdx = (i + j) % workers.length;

      tasksData.push({
        projectId: project._id,
        assignedTo: needsWorker ? workers[workerIdx]._id : undefined,
        status,
        inputData: getInputData(project.taskType, i, j),
        outputData: ['submitted', 'under_review', 'approved', 'rejected'].includes(status) ? getOutputData(project.taskType, i, j) : undefined,
        payoutAmount: project.payoutPerTask,
        priority: j,
        startedAt: needsWorker ? daysAgo(10 - j) : undefined,
        submittedAt: ['submitted', 'under_review', 'approved', 'rejected'].includes(status) ? daysAgo(5 - j) : undefined,
        timeLimit: 3600,
      });
    }
  }

  const tasks = await Task.insertMany(tasksData);
  console.log(`Seeded ${tasks.length} tasks`);

  // ============ REVIEWS (25) - for submitted/approved/rejected tasks ============
  const reviewableTasks = tasks.filter((t) =>
    ['approved', 'rejected', 'under_review'].includes(t.status)
  );
  const reviewsData = reviewableTasks.map((task, i) => {
    const decisions = ['approved', 'rejected', 'needs_revision'];
    const decision = task.status === 'approved' ? 'approved' : task.status === 'rejected' ? 'rejected' : decisions[i % 3];
    return {
      taskId: task._id,
      reviewerId: reviewers[i % reviewers.length]._id,
      decision,
      comments: getReviewComment(decision),
      score: decision === 'approved' ? 80 + (i % 20) : decision === 'rejected' ? 30 + (i % 30) : 50 + (i % 20),
      reviewedAt: daysAgo(3 - (i % 3)),
    };
  });

  const reviews = await Review.insertMany(reviewsData);
  console.log(`Seeded ${reviews.length} reviews`);

  // ============ NOTIFICATIONS (30) ============
  const notifTypes = ['task_assigned', 'task_rejected', 'task_approved', 'review_needed', 'payment_completed', 'withdrawal_approved', 'system'];
  const notificationsData: any[] = [];

  // Worker notifications
  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    notificationsData.push({
      userId: w._id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task in "${projects[i % projects.length].title}"`,
      read: i % 3 === 0,
      metadata: { taskId: tasks[i % tasks.length]._id.toString() },
      createdAt: daysAgo(i),
    });
    if (i < 5) {
      notificationsData.push({
        userId: w._id,
        type: i % 2 === 0 ? 'task_approved' : 'task_rejected',
        title: i % 2 === 0 ? 'Task Approved' : 'Task Needs Revision',
        message: i % 2 === 0 ? 'Your task submission has been approved! Earnings credited.' : 'Your task submission needs revision. Please check reviewer feedback.',
        read: false,
        metadata: { taskId: tasks[i % tasks.length]._id.toString() },
        createdAt: daysAgo(i + 1),
      });
    }
  }

  // Reviewer notifications
  for (let i = 0; i < reviewers.length; i++) {
    notificationsData.push({
      userId: reviewers[i]._id,
      type: 'review_needed',
      title: 'New Task to Review',
      message: `A task in "${projects[(i + 5) % projects.length].title}" is ready for review`,
      read: i % 2 === 0,
      metadata: { taskId: tasks[(i + 10) % tasks.length]._id.toString() },
      createdAt: daysAgo(i + 2),
    });
  }

  // System notifications to admins
  for (const admin of admins) {
    notificationsData.push({
      userId: admin._id,
      type: 'system',
      title: 'Weekly Platform Report',
      message: 'Platform activity report for the week is ready. 450 tasks completed, 12 new workers registered.',
      read: false,
      createdAt: daysAgo(1),
    });

    notificationsData.push({
      userId: admin._id,
      type: 'system',
      title: 'High-risk Withdrawal Pattern',
      message: 'Multiple withdrawal attempts from the same device were flagged for manual review.',
      read: false,
      metadata: {
        category: 'fraud',
        riskFlags: ['multiple_withdrawals', 'device_mismatch', 'velocity_spike'],
        severity: 'high',
      },
      createdAt: daysAgo(0),
    });

    notificationsData.push({
      userId: admin._id,
      type: 'system',
      title: 'Trust Score Anomaly Detected',
      message: 'A worker account showed a rapid trust score drop with repeated rejected submissions.',
      read: false,
      metadata: {
        category: 'fraud',
        riskFlags: ['trust_drop', 'repeated_rejections'],
        severity: 'medium',
      },
      createdAt: daysAgo(2),
    });

    notificationsData.push({
      userId: admin._id,
      type: 'system',
      title: 'Suspicious Login Behavior',
      message: 'Unusual geolocation changes were detected across consecutive login attempts.',
      read: true,
      metadata: {
        category: 'fraud',
        riskFlags: ['impossible_travel', 'ip_rotation'],
        severity: 'medium',
      },
      createdAt: daysAgo(3),
    });
  }

  const notifications = await Notification.insertMany(notificationsData);
  console.log(`Seeded ${notifications.length} notifications`);

  // ============ TRANSACTIONS (30) ============
  const transactionsData: any[] = [];

  // Earnings for workers
  for (let i = 0; i < workers.length; i++) {
    if (i >= 10) continue; // skip last 2 workers (new/suspended)
    transactionsData.push({
      userId: workers[i]._id,
      type: 'earning',
      amount: 200 + i * 50,
      status: 'completed',
      description: `Earning for task in "${projects[i % projects.length].title}"`,
      metadata: { taskId: tasks[i % tasks.length]._id.toString() },
      createdAt: daysAgo(7 - i),
    });
    // Extra earnings
    if (i < 5) {
      transactionsData.push({
        userId: workers[i]._id,
        type: 'earning',
        amount: 150 + i * 30,
        status: 'completed',
        description: `Earning for task in "${projects[(i + 3) % projects.length].title}"`,
        metadata: { taskId: tasks[(i + 5) % tasks.length]._id.toString() },
        createdAt: daysAgo(5 - i),
      });
    }
  }

  // Withdrawals
  const withdrawalWorkers = [workers[0], workers[2], workers[4], workers[7], workers[9]];
  for (let i = 0; i < withdrawalWorkers.length; i++) {
    const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'pending', 'completed', 'pending', 'failed'];
    transactionsData.push({
      userId: withdrawalWorkers[i]._id,
      type: 'withdrawal',
      amount: 500 + i * 200,
      mpesaReceipt: statuses[i] === 'completed' ? `SAK${String(i + 1).padStart(6, '0')}RW` : undefined,
      transactionId: `WD-${Date.now()}-${i}`,
      status: statuses[i],
      description: `M-Pesa withdrawal to 07${i}1234567`,
      metadata: { phoneNumber: `07${i}1234567` },
      createdAt: daysAgo(3 - (i % 3)),
    });
  }

  // Deposits from clients
  for (let i = 0; i < clients.length; i++) {
    transactionsData.push({
      userId: clients[i]._id,
      type: 'deposit',
      amount: 10000 + i * 5000,
      mpesaReceipt: `SAK${String(i + 10).padStart(6, '0')}DP`,
      transactionId: `DP-${Date.now()}-${i}`,
      status: 'completed',
      description: `M-Pesa deposit from 07${i + 3}4567890`,
      metadata: { phoneNumber: `07${i + 3}4567890` },
      createdAt: daysAgo(10 - i),
    });
  }

  // Bonus
  transactionsData.push({
    userId: workers[9]._id,
    type: 'bonus',
    amount: 500,
    status: 'completed',
    description: 'Performance bonus - Top worker of the week',
    createdAt: daysAgo(2),
  });

  const transactions = await Transaction.insertMany(transactionsData);
  console.log(`Seeded ${transactions.length} transactions`);

  // ============ AUDIT LOGS (25) ============
  const auditActions = ['login', 'create_project', 'assign_task', 'submit_task', 'review_task', 'approve_withdrawal', 'update_user', 'delete_task'];
  const auditResources = ['user', 'project', 'task', 'review', 'transaction'];
  const auditLogsData: any[] = [];

  for (let i = 0; i < 25; i++) {
    const userIdx = i % users.length;
    const actionIdx = i % auditActions.length;
    auditLogsData.push({
      userId: users[userIdx]._id,
      action: auditActions[actionIdx],
      resource: auditResources[i % auditResources.length],
      resourceId: projects[i % projects.length]._id,
      metadata: { detail: `Seed audit log entry ${i + 1}` },
      ipAddress: `192.168.1.${100 + i}`,
      userAgent: `Mozilla/5.0 (${i % 2 === 0 ? 'Macintosh' : 'Windows NT 10.0'}) Seed/1.0`,
      createdAt: daysAgo(i),
    });
  }

  const auditLogs = await AuditLog.insertMany(auditLogsData);
  console.log(`Seeded ${auditLogs.length} audit logs`);

  // ============ SUMMARY ============
  console.log('\n===== SEED COMPLETE =====');
  console.log(`Users:         ${users.length} (${admins.length} admin, ${clients.length} client, ${workers.length} worker, ${reviewers.length} reviewer)`);
  console.log(`Projects:      ${projects.length}`);
  console.log(`Tasks:         ${tasks.length}`);
  console.log(`Reviews:       ${reviews.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Transactions:  ${transactions.length}`);
  console.log(`Audit Logs:    ${auditLogs.length}`);
  console.log('\nAll users password: Admin@123');
  console.log('Admin login: gibubett@gmail.com / Admin@123');

  await mongoose.disconnect();
  process.exit(0);
}

// ============ HELPERS ============
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function getInputData(taskType: string, projectIdx: number, taskIdx: number): Record<string, unknown> {
  const inputs: Record<string, () => Record<string, unknown>> = {
    image_annotation: () => ({
      imageUrl: `https://res.cloudinary.com/hiveai/image/upload/v1/datasets/project_${projectIdx}/img_${taskIdx}.jpg`,
      labels: ['animal', 'vegetation', 'terrain', 'vehicle', 'person'],
      instructions: 'Draw bounding boxes around all objects and assign appropriate labels.',
    }),
    text_classification: () => ({
      text: [
        'Serikali imepiga marufuku uuzaji wa bidhaa bandia sokoni.',
        'The new mobile banking app has received positive reviews from users across Kenya.',
        'Hali ya hewa itakuwa ya jua kali siku ya leo katika sehemu kubwa ya nchi.',
        'Kenya kwanza government announces new education reforms for 2026.',
      ][taskIdx % 4],
      categories: ['positive', 'negative', 'neutral'],
      instructions: 'Classify the text into the most appropriate category.',
    }),
    rlhf_comparison: () => ({
      prompt: [
        'Explain how M-Pesa works to a foreign visitor.',
        'What are the benefits of renewable energy in Kenya?',
        'How can AI help Kenyan farmers improve crop yields?',
      ][taskIdx % 3],
      responseA: 'M-Pesa is a mobile money transfer service that allows users to deposit, withdraw, and transfer money using their mobile phones...',
      responseB: 'M-Pesa, which stands for mobile money in Swahili, is a revolutionary financial service...',
      criteria: ['helpfulness', 'accuracy', 'clarity'],
    }),
    audio_transcription: () => ({
      audioUrl: `https://res.cloudinary.com/hiveai/video/upload/v1/audio/project_${projectIdx}/clip_${taskIdx}.mp3`,
      language: ['kikuyu', 'kalenjin', 'swahili'][projectIdx % 3],
      duration: 120 + taskIdx * 30,
      instructions: 'Transcribe the audio clip accurately, preserving speaker turns.',
    }),
    video_annotation: () => ({
      videoUrl: `https://res.cloudinary.com/hiveai/video/upload/v1/video/project_${projectIdx}/clip_${taskIdx}.mp4`,
      fps: 30,
      duration: 60 + taskIdx * 15,
      labels: ['vehicle', 'pedestrian', 'road_sign', 'lane_marking'],
      instructions: 'Track and label all objects frame by frame.',
    }),
    ai_evaluation: () => ({
      aiOutput: 'The patient presents with symptoms consistent with upper respiratory tract infection. Recommended course of action includes rest, hydration, and over-the-counter medication...',
      context: `Evaluation task ${taskIdx + 1} for project ${projectIdx + 1}`,
      criteria: ['accuracy', 'completeness', 'safety', 'tone'],
      instructions: 'Rate the AI output on each criterion from 1-5 and provide justification.',
    }),
  };

  return (inputs[taskType] || inputs.text_classification)();
}

function getOutputData(taskType: string, projectIdx: number, taskIdx: number): Record<string, unknown> {
  return {
    annotations: [
      { label: 'object_1', confidence: 0.92, bbox: [100, 200, 300, 400] },
      { label: 'object_2', confidence: 0.85, bbox: [150, 250, 350, 450] },
    ],
    classification: 'positive',
    selectedResponse: 'A',
    transcription: 'Sample transcription output for the audio clip.',
    rating: { accuracy: 4, completeness: 3, safety: 5, tone: 4 },
    workerNotes: `Completed annotation for project ${projectIdx + 1}, task ${taskIdx + 1}`,
    timeSpent: 600 + taskIdx * 120,
  };
}

function getReviewComment(decision: string): string {
  const comments: Record<string, string[]> = {
    approved: [
      'Excellent work! Annotations are accurate and complete.',
      'Good quality submission. All criteria met.',
      'Well done. Minor improvements possible but overall great work.',
    ],
    rejected: [
      'Several annotations are missing or incorrect. Please redo.',
      'Quality below threshold. Multiple errors found in classification.',
      'Incomplete work. Please review the guidelines and resubmit.',
    ],
    needs_revision: [
      'Almost there! Please fix the bounding boxes on objects 3 and 5.',
      'Good attempt but classification for items 2 and 4 needs correction.',
      'Please add missing labels for the highlighted sections.',
    ],
  };
  const list = comments[decision] || comments.approved;
  return list[Math.floor(Math.random() * list.length)];
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
