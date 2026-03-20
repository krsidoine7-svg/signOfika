import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Send, CheckCircle, Clock, Plus, ArrowUpRight, ChevronRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user stats
  const { count: templatesCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_archived', false)

  const { count: submissionsCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const { count: completedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const stats = [
    { label: 'Total', value: submissionsCount || 0, icon: <Send className="h-5 w-5" />, color: 'bg-indigo-50 text-indigo-600', trend: '+12%' },
    { label: 'En attente', value: pendingCount || 0, icon: <Clock className="h-5 w-5" />, color: 'bg-amber-50 text-amber-600', trend: '-2%' },
    { label: 'Complétées', value: completedCount || 0, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600', trend: '+5%' },
    { label: 'Modèles', value: templatesCount || 0, icon: <FileText className="h-5 w-5" />, color: 'bg-burgundy-50 text-burgundy-600', trend: 'Nouveau' },
  ]

  // 1. Fetch Subscription Plan
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const plan = subscription || {
    plan_name: 'Plan Gratuit',
    signatures_used: 0,
    signatures_limit: 5,
    storage_used_bytes: 0,
    storage_limit_bytes: 5368709120 // 5GB
  }

  const storageGB = (plan.storage_used_bytes / (1024 * 1024 * 1024)).toFixed(2)
  const storageLimitGB = (plan.storage_limit_bytes / (1024 * 1024 * 1024)).toFixed(0)
  const storagePercent = plan.storage_limit_bytes > 0 ? Math.min(100, Math.round((plan.storage_used_bytes / plan.storage_limit_bytes) * 100)) : 0
  const signaturesPercent = plan.signatures_limit > 0 ? Math.min(100, Math.round((plan.signatures_used / plan.signatures_limit) * 100)) : 0

  // 2. Fetch Recent Documents (Top 5)
  const { data: recentDocsRaw } = await supabase
    .from('submissions')
    .select(`
      id, 
      status, 
      created_at,
      template:templates(name),
      submitters(id, status)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const recentDocs = recentDocsRaw?.map(doc => {
    let color = 'slate';
    if (doc.status === 'completed') color = 'emerald';
    if (doc.status === 'pending') color = 'amber';

    const tpl: any = doc.template;
    const templateName = Array.isArray(tpl) ? tpl[0]?.name : tpl?.name;

    return {
      id: doc.id,
      name: templateName || 'Document sans nom',
      date: new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      status: doc.status === 'completed' ? 'Complété' : doc.status === 'pending' ? 'En attente' : 'Brouillon',
      color: color
    }
  }) || [];

  // 3. Fetch Real Events (Audit Logs)
  const { data: realEvents } = await (supabase as any)
    .from('events')
    .select(`
      *,
      submission:submissions(template:templates(name))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch Submissions for Analytics
  const { data: chartSubmissions } = await supabase
    .from('submissions')
    .select('id, created_at, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const defaultAuditLogs = [
    { actor_name: 'Système', action: 'bienvenue', document_name: 'Votre compte SignOfika', created_at: new Date().toISOString(), color: 'bg-indigo-50 text-indigo-500' }
  ];

  const getLogColor = (type: string) => {
    switch(type) {
      case 'signature_completed': return 'bg-emerald-50 text-emerald-600'
      case 'submission_opened': return 'bg-blue-50 text-blue-600'
      case 'submission_created': return 'bg-indigo-50 text-indigo-600'
      case 'submission_declined': return 'bg-red-50 text-red-600'
      default: return 'bg-slate-50 text-slate-500'
    }
  }

  const getLogAction = (type: string) => {
    switch(type) {
      case 'signature_completed': return 'signé'
      case 'submission_opened': return 'consulté'
      case 'submission_created': return 'envoyé'
      case 'submission_declined': return 'refusé'
      case 'email_sent': return 'invité'
      default: return 'agi sur'
    }
  }

  const auditLogs = realEvents && realEvents.length > 0
    ? realEvents.map((log: any) => ({
        user: log.event_data?.name || 'Système',
        action: getLogAction(log.event_type),
        doc: (log.submission as any)?.template?.name || 'Document',
        time: new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        color: getLogColor(log.event_type)
      }))
    : defaultAuditLogs.map((log: any) => ({
        user: log.actor_name,
        action: log.action,
        doc: log.document_name,
        time: 'Moins de 2min',
        color: log.color
      }));



  const templatesLimit = 15;
  const templatesPercent = Math.min(100, Math.round(((templatesCount || 0) / templatesLimit) * 100));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-700">Vue d'ensemble</h1>
            <p className="text-muted-foreground">Suivez vos flux de signature en temps réel.</p>
          </div>
          <div className="flex gap-3">
             <Button asChild className="bg-gradient-to-r from-burgundy-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-burgundy-500/20 h-11 px-6 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link href="/templates/new">
                   <Plus className="h-4 w-4 mr-2" />
                   Nouveau document
                </Link>
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white border-border/50 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group border-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.color)}>
                    {stat.icon}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full",
                    stat.trend === 'Nouveau' ? "bg-burgundy-100 text-burgundy-700" :
                    stat.trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-navy-900 mb-0.5">{stat.value}</div>
                  <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
           <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-indigo-900 text-white overflow-hidden relative min-h-[350px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-indigo-900 to-indigo-800 opacity-90" />
              <CardHeader className="relative z-10 p-8 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black">Performance Mensuelle</CardTitle>
                    <CardDescription className="text-indigo-200/60 mt-1 italic">Volume de signatures complétées</CardDescription>
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/5">Mars 2026</div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-8 flex-1 flex flex-col justify-end">
                <AnalyticsCharts data={chartSubmissions} />
                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 mt-8">
                  <div>
                    <p className="text-[10px] text-indigo-200/40 uppercase tracking-widest font-black mb-1">Taux moyen</p>
                    <p className="text-3xl font-black">{(submissionsCount || 0) > 0 ? (((completedCount || 0) / (submissionsCount || 0)) * 100).toFixed(0) : '0'}%</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-indigo-200/40 uppercase tracking-widest font-black mb-1">Délai moyen</p>
                    <p className="text-3xl font-black">~1j</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-200/40 uppercase tracking-widest font-black mb-1">Actifs</p>
                    <p className="text-3xl font-black">{pendingCount || 0}</p>
                  </div>
                </div>

              </CardContent>
           </Card>

           <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex flex-col group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-burgundy-50 flex items-center justify-center text-burgundy-600">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <CardTitle className="text-xl font-bold text-navy-900">{plan.plan_name}</CardTitle>
                </div>
                <CardDescription>Consommation de ressources</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8 flex-1 flex flex-col">
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black text-navy-700 uppercase tracking-wider">
                    <span>Signatures</span>
                    <span className="text-burgundy-600">{plan.signatures_used} / {plan.signatures_limit}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-navy-900 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${signaturesPercent}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black text-navy-700 uppercase tracking-wider">
                    <span>Modèles</span>
                    <span className="text-indigo-600">{templatesCount || 0} / {templatesLimit}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${templatesPercent}%` }} />
                  </div>
                </div>
                <div className="pt-8 mt-auto">
                   <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center group-hover:bg-slate-100/50 transition-colors">
                      <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest leading-relaxed px-4">
                        Libérez tout le potentiel de SignOfika avec le plan Illimité.
                      </p>
                      <Button className="w-full bg-white text-navy-950 border border-slate-200 shadow-sm rounded-2xl h-12 font-black text-xs hover:bg-navy-950 hover:text-white transition-all uppercase tracking-widest">
                        Upgrade
                      </Button>
                   </div>
                </div>
              </CardContent>
           </Card>
        </div>

        {/* Main Content Areas Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-none shadow-sm rounded-[2.5rem] overflow-hidden h-full">
              <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-navy-900 leading-tight">Documents récents</CardTitle>
                  <CardDescription>Flux de signature en cours</CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="text-burgundy-600 font-bold hover:bg-burgundy-50 rounded-xl" asChild>
                  <Link href="/submissions">Historique <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-[13px]">
                  <table className="w-full text-left order-collapse">
                    <thead className="bg-[#fcfdfe] text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-gray-100 opacity-60">
                      <tr>
                        <th className="px-8 py-5">Nom du document</th>
                        <th className="px-6 py-5">Statut</th>
                        <th className="px-6 py-5 text-right">Dernier accès</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:shadow-md transition-all">
                                <FileText className="h-5 w-5 text-indigo-500" />
                              </div>
                              <span className="font-bold text-navy-800 truncate max-w-[180px]">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border",
                              doc.color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              doc.color === 'amber' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-muted-foreground font-black opacity-50">
                            {doc.date}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                                <ArrowUpRight className="h-5 w-5 text-indigo-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed Column */}
          <div className="space-y-8 flex flex-col">
            <Card className="border-none bg-white shadow-sm rounded-[2.5rem] overflow-hidden flex-1">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-xl font-bold text-navy-900">Journal d'Audit</CardTitle>
                <CardDescription>Flux d'activité complet</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {auditLogs.map((act: any, i: number) => (

                    <div key={i} className="px-8 py-6 flex items-start gap-5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs shadow-sm group-hover:scale-110 transition-transform", act.color)}>
                        {act.user[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-navy-900 truncate">
                          {act.user} <span className="font-medium text-slate-400 italic">a {act.action} le document</span>
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 truncate uppercase tracking-widest">{act.doc}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 whitespace-nowrap">{act.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-8">
                  <Button variant="outline" className="w-full rounded-2xl border-slate-100 text-[10px] font-black text-slate-400 h-12 uppercase tracking-widest hover:bg-slate-50">
                    Journal complet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden text-white group p-1 shrink-0">
              <CardContent className="p-8 relative">
                 <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Send className="w-24 h-24 rotate-12" />
                 </div>
                 <h4 className="text-lg font-black mb-2">Support Direct</h4>
                 <p className="text-xs text-indigo-100/60 leading-relaxed mb-6">Un expert signature est disponible pour vous accompagner.</p>
                 <Button className="w-full bg-white text-indigo-900 rounded-2xl h-11 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                    Chater
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
