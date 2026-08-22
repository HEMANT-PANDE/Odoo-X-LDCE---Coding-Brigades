import { useEffect, useState } from 'react';
import { Search, Send, Trash2 } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Community() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  function load() {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    request(`/community${params}`).then(setPosts);
  }

  useEffect(load, [search]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await request('/community', { method: 'POST', token, body: { content, imageUrl: imageUrl.trim() || undefined } });
    setContent('');
    setImageUrl('');
    load();
  }

  async function handleDelete(id) {
    await request(`/community/${id}`, { method: 'DELETE', token });
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <PageHeader title="Community" description="Share your trip experiences and see what other travelers recommend." />

      <Card className="mb-4">
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handlePost}>
            <Textarea placeholder="Share something about a trip or activity..." value={content} onChange={(e) => setContent(e.target.value)} />
            <Input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Button type="submit" className="self-end"><Send className="size-4" /> Post</Button>
          </form>
        </CardContent>
      </Card>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        {posts.map((p) => {
          const initials = `${p.user.firstName?.[0] ?? ''}${p.user.lastName?.[0] ?? ''}`.toUpperCase();
          return (
            <Card key={p.id}>
              <CardContent className="flex gap-3">
                <Avatar>
                  {p.user.photoUrl ? <AvatarImage src={p.user.photoUrl} /> : <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.user.firstName} {p.user.lastName}</p>
                    {p.trip && <span className="text-xs text-muted-foreground">· {p.trip.name}</span>}
                  </div>
                  <p className="mt-1 text-sm">{p.content}</p>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="mt-2 max-h-64 w-full rounded-lg object-cover" />
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
                {p.user.id === user?.id && (
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {posts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No posts yet.</p>}
      </div>
    </div>
  );
}
