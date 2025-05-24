
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for the dashboard
const kpiData = [
  { title: 'Nye Reklamasjoner', value: 12, icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { title: 'Åpne Saker', value: 34, icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { title: 'Forfalt', value: 5, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  { title: 'Avsluttet i måneden', value: 28, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
];

const accountCostData = [
  { account: '4506', description: 'Intern service reklamasjon', amount: 125000 },
  { account: '7550', description: 'Ekstern garantikostnad', amount: 89000 },
  { account: '7555', description: 'Intern garantikostnad', amount: 67000 },
  { account: '7560', description: 'Ekstern GW salg', amount: 45000 },
  { account: '7565', description: 'Intern GW salg', amount: 32000 },
];

const supplierData = [
  { name: 'Comenda', value: 35, color: '#223368' },
  { name: 'Myhrvold AS', value: 28, color: '#4050a1' },
  { name: 'Westfold Telemark', value: 22, color: '#6366f1' },
  { name: 'Andre', value: 15, color: '#8b5cf6' },
];

const recentClaims = [
  { id: 'RK-2024-001', customer: 'TM Service Oslo', status: 'Ny', created: '2024-12-18' },
  { id: 'RK-2024-002', customer: 'Myhrvold AS', status: 'Avventer', created: '2024-12-17' },
  { id: 'RK-2024-003', customer: 'Comenda Norge AS', status: 'Godkjent', created: '2024-12-16' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Dashboard</h1>
            <p className="text-gray-600">Oversikt over reklamasjoner og nøkkeltall</p>
          </div>
        </div>
        <Link to="/claim/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ny Reklamasjon
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-myhrvold-primary">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Cost Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-myhrvold-primary" />
              Kostnader per Konto
            </CardTitle>
            <CardDescription>Reklamasjonskostnader fordelt på kontoer (siste 30 dager)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="account" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('nb-NO')} kr`, 'Beløp']}
                  labelFormatter={(account) => `Konto ${account}`}
                />
                <Bar dataKey="amount" fill="#223368" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supplier Distribution */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-myhrvold-primary" />
              Leverandørfordeling
            </CardTitle>
            <CardDescription>Andel reklamasjoner per leverandør</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Andel']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {supplierData.map((supplier, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: supplier.color }}></div>
                  <span className="text-sm text-gray-600">{supplier.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-myhrvold-primary" />
            Siste Reklamasjoner
          </CardTitle>
          <CardDescription>Oversikt over nylig opprettede reklamasjoner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-myhrvold-primary rounded-full"></div>
                  <div>
                    <p className="font-medium text-myhrvold-primary">{claim.id}</p>
                    <p className="text-sm text-gray-600">{claim.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'Ny' ? 'bg-orange-100 text-orange-800' :
                    claim.status === 'Avventer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {claim.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{claim.created}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/claims">
              <Button variant="outline">
                Se alle reklamasjoner
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
