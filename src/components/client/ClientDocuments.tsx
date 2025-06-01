
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DocumentUpload } from './DocumentUpload';
import { FileText, Download, Upload, Search, Calendar, Eye, Share } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: 'financial' | 'legal' | 'tax' | 'identity' | 'bank' | 'invoice' | 'receipt' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  downloadUrl?: string;
  uploadedBy?: string;
  notes?: string;
  sharedWith?: string[];
}

// Mock data - in a real app, this would come from the database
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'GST Return March 2024.pdf',
    type: 'PDF',
    size: '2.3 MB',
    uploadDate: '2024-04-15',
    category: 'tax',
    status: 'approved',
    downloadUrl: '#',
    uploadedBy: 'Client',
    notes: 'Monthly GST return for March 2024',
    sharedWith: ['employee@ca.com'],
  },
  {
    id: '2',
    name: 'Bank Statement Q1 2024.pdf',
    type: 'PDF',
    size: '1.8 MB',
    uploadDate: '2024-04-10',
    category: 'bank',
    status: 'processing',
    uploadedBy: 'Client',
    notes: 'Q1 2024 bank statements for reconciliation',
  },
  {
    id: '3',
    name: 'Income Tax Computation.xlsx',
    type: 'Excel',
    size: '456 KB',
    uploadDate: '2024-04-08',
    category: 'tax',
    status: 'approved',
    downloadUrl: '#',
    uploadedBy: 'CA Assistant',
    notes: 'Prepared income tax computation for FY 2023-24',
    sharedWith: ['client@example.com'],
  },
  {
    id: '4',
    name: 'Incorporation Certificate.pdf',
    type: 'PDF',
    size: '856 KB',
    uploadDate: '2024-03-28',
    category: 'legal',
    status: 'approved',
    downloadUrl: '#',
    uploadedBy: 'Client',
  },
];

export const ClientDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tax': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-purple-100 text-purple-800';
      case 'bank': return 'bg-orange-100 text-orange-800';
      case 'invoice': return 'bg-yellow-100 text-yellow-800';
      case 'receipt': return 'bg-pink-100 text-pink-800';
      case 'identity': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpload = async (file: File, metadata: any) => {
    // Mock upload functionality
    console.log('Uploading file:', file.name, 'with metadata:', metadata);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Document uploaded",
      description: `${file.name} has been uploaded successfully and is pending review.`,
    });
  };

  const handleShare = (docId: string) => {
    toast({
      title: "Share document",
      description: "Document sharing link has been copied to clipboard.",
    });
  };

  const handleDownload = (doc: Document) => {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    } else {
      toast({
        title: "Download not available",
        description: "This document is still being processed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ca-green-dark">My Documents</h2>
          <p className="text-muted-foreground">Upload, manage and share documents with your CA team</p>
        </div>
        <Button 
          onClick={() => setShowUpload(!showUpload)} 
          className="bg-ca-blue hover:bg-ca-blue-dark"
        >
          <Upload className="h-4 w-4 mr-2" />
          {showUpload ? 'Hide Upload' : 'Upload Documents'}
        </Button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <DocumentUpload onUpload={handleUpload} clientId={profile?.id} />
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'tax', 'financial', 'legal', 'bank', 'invoice', 'receipt', 'identity', 'other'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-ca-blue hover:bg-ca-blue-dark" : ""}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{mockDocuments.length}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {mockDocuments.filter(d => d.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {mockDocuments.filter(d => d.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {mockDocuments.filter(d => d.status === 'processing').length}
              </p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{document.name}</h3>
                  <p className="text-xs text-gray-500">{document.type} • {document.size}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
                </div>

                {document.uploadedBy && (
                  <div className="text-xs text-gray-500">
                    <span>By: {document.uploadedBy}</span>
                  </div>
                )}

                {document.notes && (
                  <p className="text-xs text-gray-600 line-clamp-2">{document.notes}</p>
                )}

                {document.sharedWith && document.sharedWith.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span>Shared with {document.sharedWith.length} user(s)</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {document.downloadUrl && document.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(document.id)}
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by uploading your first document'}
            </p>
            <Button 
              onClick={() => setShowUpload(true)} 
              className="bg-ca-blue hover:bg-ca-blue-dark"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
