'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import { Switch } from '@repo/ui/switch';
import { Badge } from '@repo/ui/badge';
import { Separator } from '@repo/ui/separator';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Eye,
  FileText,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  requests: number;
  earnings: number;
  avgCost: number;
  coverImage?: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  pages?: number;
  accessLevel?: string;
  aiAccessEnabled?: boolean;
  pricing?: number;
}

interface ContentDetailsDialogProps {
  content: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContentDetailsDialog({
  content,
  open,
  onOpenChange,
}: ContentDetailsDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (open && content) {
      if (!editedContent || editedContent.id !== content.id) {
        setEditedContent({ ...content });
      }
    } else if (!open) {
      setIsEditing(false);
      setEditedContent(null);
    }
  }, [open, content, editedContent]);

  if (!content) return null;

  const currentContent = editedContent || content;

  const handleEdit = () => {
    if (!editedContent) {
      setEditedContent({ ...content });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    toast({
      title: 'Changes saved',
      description: 'Content settings have been updated successfully.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(null);
  };

  const handleToggleAIAccess = (enabled: boolean) => {
    if (editedContent) {
      setEditedContent({ ...editedContent, aiAccessEnabled: enabled });
    }
  };

  const handleAccessLevelChange = (value: string) => {
    if (editedContent) {
      setEditedContent({ ...editedContent, accessLevel: value });
    }
  };

  const handlePricingChange = (value: string) => {
    if (editedContent) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setEditedContent({ ...editedContent, pricing: numValue });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-content-details"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{currentContent.title}</DialogTitle>
          <DialogDescription>
            {currentContent.type} • Uploaded{' '}
            {new Date(currentContent.uploadedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          <div className="flex justify-center">
            <div className="relative w-48 h-72 rounded-md overflow-hidden bg-muted flex items-center justify-center">
              {currentContent.coverImage ? (
                <Image
                  src={currentContent.coverImage}
                  alt={currentContent.title}
                  className="w-full h-full object-cover"
                  data-testid="img-cover"
                  width={192}
                  height={288}
                />
              ) : (
                <div
                  className="flex flex-col items-center gap-2 text-muted-foreground"
                  data-testid="placeholder-cover"
                >
                  <BookOpen className="w-16 h-16" />
                  <p className="text-sm">No cover image</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Details */}
          <div className="space-y-4">
            {currentContent.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {currentContent.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {currentContent.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Author</p>
                    <p
                      className="text-sm font-medium"
                      data-testid="text-author"
                    >
                      {currentContent.author}
                    </p>
                  </div>
                </div>
              )}

              {currentContent.publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Published</p>
                    <p className="text-sm font-medium">
                      {new Date(
                        currentContent.publishedDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {currentContent.pages !== undefined &&
                currentContent.pages > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pages</p>
                      <p className="text-sm font-medium">
                        {currentContent.pages}
                      </p>
                    </div>
                  </div>
                )}

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Requests</p>
                  <p
                    className="text-sm font-medium"
                    data-testid="text-requests"
                  >
                    {currentContent.requests.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Earnings
                  </p>
                  <p
                    className="text-sm font-medium"
                    data-testid="text-earnings"
                  >
                    ${currentContent.earnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Content Settings</h3>

            <div className="space-y-4">
              {/* Access Level */}
              <div className="space-y-2">
                <Label htmlFor="access-level">Access Level</Label>
                {isEditing ? (
                  <Select
                    value={currentContent.accessLevel}
                    onValueChange={handleAccessLevelChange}
                  >
                    <SelectTrigger
                      id="access-level"
                      data-testid="select-access-level"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    <Badge
                      variant={
                        currentContent.accessLevel === 'Premium'
                          ? 'default'
                          : 'secondary'
                      }
                      data-testid="badge-access-level"
                    >
                      {currentContent.accessLevel}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <Label htmlFor="pricing">Cost per Request</Label>
                {isEditing ? (
                  <Input
                    id="pricing"
                    type="number"
                    step="0.001"
                    value={currentContent.pricing}
                    onChange={(e) => handlePricingChange(e.target.value)}
                    data-testid="input-pricing"
                  />
                ) : (
                  <p className="text-sm font-medium" data-testid="text-pricing">
                    ${currentContent.pricing?.toFixed(3)}
                  </p>
                )}
              </div>

              {/* AI Access Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-access">AI Platform Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI assistants to access this content
                  </p>
                </div>
                {isEditing ? (
                  <Switch
                    id="ai-access"
                    checked={currentContent.aiAccessEnabled}
                    onCheckedChange={handleToggleAIAccess}
                    data-testid="switch-ai-access"
                  />
                ) : (
                  <Badge
                    variant={
                      currentContent.aiAccessEnabled ? 'default' : 'secondary'
                    }
                    data-testid="badge-ai-access"
                  >
                    {currentContent.aiAccessEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} data-testid="button-save">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} data-testid="button-edit">
                Edit Settings
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
