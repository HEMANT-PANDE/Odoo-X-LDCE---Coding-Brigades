import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Users, Luggage, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trends, setTrends] = useState(null);

  function loadUsers() { request('/admin/users', { token }).then(setUsers); }

  useEffect(() => {
    loadUsers();
    request('/admin/stats/popular-cities', { token }).then(setCities);
    request('/admin/stats/popular-activities', { token }).then(setActivities);
    request('/admin/stats/trends', { token }).then(setTrends);
  }, [token]);

  async function handleDeleteUser(id) {
    await request(`/admin/users/${id}`, { method: 'DELETE', token });
    setUsers(users.filter((u) => u.id !== id));
    toast.success('User deleted');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title="Admin" description="Manage users and monitor platform activity." />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="cities">Popular Cities</TabsTrigger>
          <TabsTrigger value="activities">Popular Activities</TabsTrigger>
          <TabsTrigger value="trends">User Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Trips</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.firstName} {u.lastName} {u.isAdmin && <Badge variant="secondary" className="ml-1">admin</Badge>}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{u._count.trips}</TableCell>
                      <TableCell className="text-muted-foreground">{u.createdAt.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteUser(u.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <div className="flex flex-col gap-2">
            {cities.map((c) => (
              <Card key={c.city.id} className="flex-row items-center justify-between p-4">
                <span className="text-sm font-medium">{c.city.name}, {c.city.country}</span>
                <Badge variant="secondary">{c.tripCount} trip{c.tripCount === 1 ? '' : 's'}</Badge>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <div className="flex flex-col gap-2">
            {activities.map((a) => (
              <Card key={a.activity.id} className="flex-row items-center justify-between p-4">
                <span className="text-sm font-medium">{a.activity.name}</span>
                <Badge variant="secondary">{a.bookingCount} booking{a.bookingCount === 1 ? '' : 's'}</Badge>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          {trends && (
            <>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <Card className="items-center gap-1 p-4 text-center"><Users className="size-5 text-primary" /><p className="text-2xl font-semibold">{trends.userCount}</p><p className="text-xs text-muted-foreground">Users</p></Card>
                <Card className="items-center gap-1 p-4 text-center"><Luggage className="size-5 text-primary" /><p className="text-2xl font-semibold">{trends.tripCount}</p><p className="text-xs text-muted-foreground">Trips</p></Card>
                <Card className="items-center gap-1 p-4 text-center"><MessageSquare className="size-5 text-primary" /><p className="text-2xl font-semibold">{trends.postCount}</p><p className="text-xs text-muted-foreground">Community posts</p></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Signups by Day</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trends.signupsByDay}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#525ea7" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
