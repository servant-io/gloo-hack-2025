'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Clock } from 'lucide-react';

interface Transaction {
  id: number;
  publisher: string;
  amount: number;
  timeAgo: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    publisher: 'Westminster Seminary',
    amount: 12.34,
    timeAgo: '2m ago',
  },
  { id: 2, publisher: 'Crossway Publishers', amount: 45.67, timeAgo: '5m ago' },
  { id: 3, publisher: 'Baker Academic', amount: 23.89, timeAgo: '8m ago' },
  { id: 4, publisher: 'Zondervan', amount: 67.12, timeAgo: '12m ago' },
  { id: 5, publisher: 'IVP Academic', amount: 34.56, timeAgo: '15m ago' },
  { id: 6, publisher: 'Eerdmans Publishing', amount: 28.9, timeAgo: '18m ago' },
];

export default function LiveFeed() {
  const [transactions, setTransactions] = useState(mockTransactions);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((current) => {
        const newTransaction = {
          id: Date.now(),
          publisher:
            mockTransactions[
              Math.floor(Math.random() * mockTransactions.length)
            ]?.publisher || 'Unknown Publisher',
          amount: parseFloat((Math.random() * 80 + 10).toFixed(2)),
          timeAgo: 'Just now',
        };
        return [newTransaction, ...current.slice(0, 5)];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {transactions.map((transaction, idx) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-md bg-card border border-card-border hover-elevate transition-all"
          style={{ opacity: 1 - idx * 0.15 }}
          data-testid={`transaction-${idx}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {transaction.publisher}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {transaction.timeAgo}
              </div>
            </div>
          </div>
          <div className="font-mono font-semibold text-chart-2">
            +${transaction.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
