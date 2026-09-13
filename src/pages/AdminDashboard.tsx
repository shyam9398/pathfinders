import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  Bell, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Plus,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '@/components/Navigation/Navbar';
import { capacityStore } from '@/services/capacityStore';
import { Announcement } from '@/types/capacityConnect';
import { toast } from 'sonner';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'trainee' | 'trainer' | 'admin';
  status: 'approved' | 'pending' | 'suspended';
  registeredDate: string;
  department: string;
}

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState(() => capacityStore.getAnnouncements());
  const [courses] = useState(() => capacityStore.getCourses());

  // Demo user registry for governance demonstration
  const [users, setUsers] = useState<PlatformUser[]>([
    {
      id: 'u-1',
      name: 'Pavan Kumar',
      email: 'pavan.kumar@student.edu',
      role: 'trainee',
      status: 'approved',
      registeredDate: 'Sept 01, 2026',
      department: 'Computer Science'
    },
    {
      id: 'u-2',
      name: 'Dr. Rakesh Sharma',
      email: 'rakesh.sharma@capacityconnect.edu',
      role: 'trainer',
      status: 'approved',
      registeredDate: 'Aug 15, 2026',
      department: 'Artificial Intelligence'
    },
    {
      id: 'u-3',
      name: 'Neha Chawla',
      email: 'neha.chawla@student.edu',
      role: 'trainee',
      status: 'pending',
      registeredDate: 'Sept 12, 2026',
      department: 'Data Science'
    },
    {
      id: 'u-4',
      name: 'Prof. Ananya Sen',
      email: 'ananya.sen@trainer.edu',
      role: 'trainer',
      status: 'pending',
      registeredDate: 'Sept 13, 2026',
      department: 'Cloud Computing'
    }
  ]);

  // Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<Announcement['type']>('announcement');

  const handleUpdateUserStatus = (userId: string, status: 'approved' | 'suspended') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    toast.success(`User status updated to ${status}!`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      content: newContent || 'System announcement regarding curriculum update.',
      type: newType,
      audience: 'all',
      publishedBy: 'System Administrator',
      publishedAt: new Date().toISOString()
    };

    capacityStore.addAnnouncement(created);
    setAnnouncements(capacityStore.getAnnouncements());
    setAnnouncementModalOpen(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Announcement broadcast to platform!');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col lg:pl-60">
      <Navbar 
        breadcrumbs={[
          { label: 'Admin Portal' }
        ]} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Admin Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Organization & Platform Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Monitor organization-wide skill development, manage accredited trainers, approve user credentials, and publish notifications.
            </p>
          </div>

          <Button 
            onClick={() => setAnnouncementModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Publish Announcement
          </Button>
        </div>

        {/* Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trainees</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">3,450</div>
            <span className="text-[11px] text-emerald-600 font-medium">+18% enrollment this month</span>
          </Card>

          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certified Trainers</span>
            <div className="text-3xl font-black text-blue-600 mt-1.5">48</div>
            <span className="text-[11px] text-slate-500">Across 12 technical disciplines</span>
          </Card>

          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Courses</span>
            <div className="text-3xl font-black text-purple-600 mt-1.5">{courses.length}</div>
            <span className="text-[11px] text-slate-500">All modules accredited</span>
          </Card>

          <Card className="glass-card p-5 border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificates Issued</span>
            <div className="text-3xl font-black text-amber-500 mt-1.5">1,120</div>
            <span className="text-[11px] text-slate-500">Tamper-proof verified</span>
          </Card>
        </div>

        {/* Two Columns: User Approvals & Announcements Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* User Approval & Roles Registry (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                User Registration & Approval Queue
              </h2>
              <Badge variant="outline" className="text-xs">
                {users.filter(u => u.status === 'pending').length} Pending Approvals
              </Badge>
            </div>

            <Card className="glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="py-3 px-4">Name & Email</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 dark:text-white block">{u.name}</strong>
                          <span className="text-slate-400 text-[11px]">{u.email}</span>
                        </td>
                        <td className="py-3 px-3 capitalize font-medium text-slate-700 dark:text-slate-300">
                          {u.role}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{u.department}</td>
                        <td className="py-3 px-3">
                          {u.status === 'approved' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              Approved
                            </Badge>
                          ) : u.status === 'pending' ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              Pending
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                              Suspended
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {u.status === 'pending' ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateUserStatus(u.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 px-2.5 text-[11px]"
                            >
                              Approve
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateUserStatus(u.id, u.status === 'approved' ? 'suspended' : 'approved')}
                              className="rounded-lg h-7 px-2 text-[11px]"
                            >
                              {u.status === 'approved' ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Published Announcements (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Published Notifications
              </h2>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div 
                  key={ann.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] uppercase font-mono">
                      {ann.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Broadcast Announcement Modal */}
      <Dialog open={announcementModalOpen} onOpenChange={setAnnouncementModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Broadcast System Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish news, newly added learning content, or cohort achievements to all users.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notification Title</label>
              <Input 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="e.g. Cohort 2026 Assessment Schedule Released" 
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notification Category</label>
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="announcement">Platform Announcement</option>
                <option value="achievement">Achievement & Spotlight</option>
                <option value="new_content">New Learning Content</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Content / Message</label>
              <textarea 
                value={newContent} 
                onChange={(e) => setNewContent(e.target.value)} 
                placeholder="Details of the announcement..." 
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAnnouncementModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                Broadcast Now
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
