import { useState } from 'react';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';
import PageHeader from '../components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Search() {
  const [tab, setTab] = useState('cities');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader title="Search" description="Discover cities and activities for your next trip." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="cities"><CityPicker /></TabsContent>
        <TabsContent value="activities"><ActivityPicker /></TabsContent>
      </Tabs>
    </div>
  );
}
