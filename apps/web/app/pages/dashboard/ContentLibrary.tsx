'use client';

import { useState } from 'react';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { useAuth } from '@/lib/auth';
import { mockPublisherData } from '@/lib/mockData';
import {
  Upload,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/table';
import ContentDetailsDialog from '@/components/ContentDetailsDialog';

export default function ContentLibrary() {
  const { user } = useAuth();
  const data = user
    ? mockPublisherData[user.id as keyof typeof mockPublisherData]
    : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!data) return null;

  const filteredContent = data.content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Content Library
          </h1>
          <p className="text-muted-foreground">
            Manage and track your published content
          </p>
        </div>
        <Button data-testid="button-upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload Content
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Button variant="outline" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead className="text-right">Avg. Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => {
                    setSelectedContent(item);
                    setDialogOpen(true);
                  }}
                  data-testid={`row-content-${idx}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {item.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-heading font-semibold text-primary">
                    ${item.earnings.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${item.avgCost.toFixed(3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No content found matching your search.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-chart-1/10">
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Content</div>
              <div className="font-heading text-2xl font-bold text-foreground">
                {data.content.length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-chart-2/10">
              <FileText className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Most Popular</div>
              <div className="font-medium text-foreground truncate">
                {data.content[0]?.title}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-md bg-chart-3/10">
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Avg. Earnings/Item
              </div>
              <div className="font-heading text-2xl font-bold text-foreground">
                ${(data.totalEarnings / data.content.length).toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ContentDetailsDialog
        content={selectedContent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
