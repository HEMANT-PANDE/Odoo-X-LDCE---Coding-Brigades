import { useState } from 'react';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';
import PageHeader from '../components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function Search() {
  const [tab, setTab] = useState('cities');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore & Search</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover destinations and activities for your trips.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cities">🌍 Cities</TabsTrigger>
          <TabsTrigger value="activities">🎯 Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="cities">
          <Card>
            <CardContent className="p-6">
              <CityPicker />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activities">
          <Card>
            <CardContent className="p-6">
              <ActivityPicker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
