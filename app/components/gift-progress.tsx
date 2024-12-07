import { Gift, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Progress } from '~/components/ui/progress';
import { Slider } from '~/components/ui/slider';
import { Textarea } from '~/components/ui/textarea';
import { useToast } from '~/hooks/use-toast';

interface GiftPlan {
  id: number;
  wishId: number;
  gifterId: number;
  percentage: number;
  message: string;
  createdAt: string;
}

interface GiftProgressProps {
  wishId: string;
}

export default function GiftProgress({ wishId }: GiftProgressProps) {
  const { toast } = useToast();
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [contribution, setContribution] = useState(10);
  const [message, setMessage] = useState('');

  const { data: giftPlans = [], isLoading } = useQuery<GiftPlan[]>({
    queryKey: ['gift-plans', wishId],
    queryFn: async () => {
      const response = await fetch(`/api/gift-plans/${wishId}`, {
        credentials: 'include',
      });
      if (!response.ok)
        throw new Error('Failed to fetch gift plans');
      return response.json();
    },
  });

  const addGiftPlan = useMutation({
    mutationFn: async (data: { percentage: number; message: string }) => {
      const response = await fetch('/api/gift-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wishId,
          percentage: data.percentage,
          message: data.message,
        }),
      });
      if (!response.ok)
        throw new Error('Failed to add gift plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-plans', wishId] });
      toast({
        title: 'Gift plan added',
        description: 'Your contribution has been recorded.',
      });
      setMessage('');
      setIsMessageOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add gift plan',
        description: error.message,
      });
    },
  });

  const totalPercentage = giftPlans.reduce(
    (sum, plan) => sum + plan.percentage,
    0,
  );

  const handleContribute = async () => {
    try {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication required',
          description: 'Please log in to contribute to this gift',
        });
        return;
      }

      if (totalPercentage + contribution > 100) {
        toast({
          variant: 'destructive',
          title: 'Invalid contribution',
          description: 'Total contribution cannot exceed 100%',
        });
        return;
      }

      if (contribution < 10) {
        toast({
          variant: 'destructive',
          title: 'Invalid contribution',
          description: 'Minimum contribution is 10%',
        });
        return;
      }

      await addGiftPlan.mutateAsync({
        percentage: contribution,
        message: message.trim(),
        wishId,
      });

      setContribution(10);
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to add contribution',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  if (isLoading) {
    return <Progress value={0} className="w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>
            {totalPercentage}
            %
          </span>
        </div>
        <Progress value={totalPercentage} className="w-full" />
      </div>

      {totalPercentage < 100 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your contribution</Label>
            <Slider
              value={[contribution]}
              onValueChange={([value]) => setContribution(value)}
              step={10}
              min={10}
              max={100 - totalPercentage}
            />
            <div className="text-right text-sm text-muted-foreground">
              {contribution}
              %
            </div>
          </div>

          <div className="flex space-x-2">
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a message</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Leave a message for other contributors..."
                  className="min-h-[100px]"
                />
                <Button onClick={handleContribute}>
                  <Gift className="h-4 w-4 mr-2" />
                  Contribute
                </Button>
              </DialogContent>
            </Dialog>

            <Button onClick={handleContribute} className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          </div>
        </div>
      )}

      {giftPlans.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Messages</h4>
          {giftPlans.map(plan => (
            <Card key={plan.id} className="p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Contribution:
                  {' '}
                  {plan.percentage}
                  %
                </span>
                <span className="text-muted-foreground">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </span>
              </div>
              {plan.message && (
                <p className="mt-2 text-sm">{plan.message}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
