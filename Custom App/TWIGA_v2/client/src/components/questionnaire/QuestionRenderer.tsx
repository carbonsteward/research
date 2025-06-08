import { useState } from 'react';
import { Question } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Info } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const [fileUploading, setFileUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    try {
      // In a real implementation, this would upload to cloud storage
      // For now, we'll simulate a file upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fileName = file.name;
      onChange(`uploaded_${fileName}`);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setFileUploading(false);
    }
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'single_select':
        return (
          <RadioGroup value={value || ''} onValueChange={onChange}>
            <div className="space-y-3">
              {question.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your response..."
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your detailed response..."
              rows={6}
              className="w-full resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 100 words recommended</span>
              <span>{(value || '').split(' ').filter((w: string) => w.length > 0).length} words</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter number..."
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">
              {question.questionText.includes('percentage') ? '%' : ''}
            </span>
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-sm font-medium text-foreground">
                    {fileUploading ? 'Uploading...' : 'Click to upload file'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {value && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  File uploaded: {typeof value === 'string' ? value.replace('uploaded_', '') : 'Unknown file'}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-muted-foreground">
            Unsupported question type: {question.questionType}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {question.questionText}
          {question.isRequired && <span className="text-destructive ml-1">*</span>}
        </h3>

        {question.helpText && (
          <p className="text-sm text-muted-foreground mb-4">
            {question.helpText}
          </p>
        )}
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Scoring Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">Scoring Information</h5>
              <p className="text-sm text-blue-700">
                This question contributes <strong>{question.zebraPoints} points</strong> to your Zebra Score
                and <strong>{question.disclosurePoints} point(s)</strong> to your Disclosure Score.
                {question.sdgMapping && question.sdgMapping.length > 0 && (
                  <span className="block mt-1">
                    Related SDGs: {question.sdgMapping.join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
