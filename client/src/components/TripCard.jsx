import { Link } from 'react-router-dom';
import { CalendarRange, MapPin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_STYLE = {
  ongoing: 'bg-[color-mix(in_oklch,var(--chart-3),white_75%)] text-[#1c6f9c]',
  upcoming: 'bg-[color-mix(in_oklch,var(--primary),white_85%)] text-primary',
  completed: 'bg-muted text-muted-foreground',
};

export default function TripCard({ trip, onDelete }) {
  return (
    <Card className="gap-3 py-4 transition-shadow hover:shadow-md">
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{trip.name}</CardTitle>
          {trip.status && (
            <Badge className={STATUS_STYLE[trip.status] ?? ''} variant="secondary">
              {trip.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 px-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarRange className="size-4" />
          {trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}
        </span>
        {trip.stopCount != null && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {trip.stopCount} stop{trip.stopCount === 1 ? '' : 's'}
          </span>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 px-4">
        <Button size="sm" variant="secondary" render={<Link to={`/trips/${trip.id}`} />}>View</Button>
        <Button size="sm" variant="outline" render={<Link to={`/trips/${trip.id}/builder`} />}>Edit</Button>
        {onDelete && (
          <Button size="icon-sm" variant="ghost" className="ml-auto text-destructive" onClick={() => onDelete(trip.id)}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
