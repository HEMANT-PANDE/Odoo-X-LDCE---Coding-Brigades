import { useState } from 'react';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';

export default function Search() {
  const [tab, setTab] = useState('cities');

  return (
    <div className="page">
      <h1>Search</h1>
      <div className="tabs">
        <button className={tab === 'cities' ? 'active' : ''} onClick={() => setTab('cities')}>Cities</button>
        <button className={tab === 'activities' ? 'active' : ''} onClick={() => setTab('activities')}>Activities</button>
      </div>
      {tab === 'cities' ? <CityPicker /> : <ActivityPicker />}
    </div>
  );
}
