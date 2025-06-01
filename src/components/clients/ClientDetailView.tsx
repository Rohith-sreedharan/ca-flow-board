
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients } from '@/hooks/useClients';
import { Edit, Save, X, Plus, Phone, Mail, MessageSquare, Calendar, FileText } from 'lucide-react';

interface ClientDetailViewProps {
  client: any;
  onClose: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({ client, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);
  const [newCommunication, setNewCommunication] = useState({
    type: 'email' as 'email' | 'phone' | 'whatsapp' | 'meeting' | 'document',
    subject: '',
    message: '',
    recipient_email: client.email || '',
    recipient_phone: client.phone || '',
  });

  const { updateClient, isUpdating } = useClients();

  const handleSave = () => {
    updateClient({ id: client.id, ...editedClient });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient(client);
    setIsEditing(false);
  };

  const handleAddCommunication = () => {
    // Implementation for adding communication
    console.log('Adding communication:', newCommunication);
    setNewCommunication({
      type: 'email',
      subject: '',
      message: '',
      recipient_email: client.email || '',
      recipient_phone: client.phone || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Client Details</h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isUpdating}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Client Code</Label>
                      <Input value={client.client_code} disabled />
                    </div>
                    
                    <div>
                      <Label>Company Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.name}
                          onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                        />
                      ) : (
                        <Input value={client.name} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Contact Person</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.contact_person || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, contact_person: e.target.value })}
                        />
                      ) : (
                        <Input value={client.contact_person || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedClient.email || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                        />
                      ) : (
                        <Input value={client.email || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.phone || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                        />
                      ) : (
                        <Input value={client.phone || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Business Type</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.business_type || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, business_type: e.target.value })}
                        />
                      ) : (
                        <Input value={client.business_type || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Industry</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.industry || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, industry: e.target.value })}
                        />
                      ) : (
                        <Input value={client.industry || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>GST Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.gst_number || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, gst_number: e.target.value })}
                        />
                      ) : (
                        <Input value={client.gst_number || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>PAN Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.pan_number || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, pan_number: e.target.value })}
                        />
                      ) : (
                        <Input value={client.pan_number || ''} disabled />
                      )}
                    </div>

                    <div>
                      <Label>Company Registration Number</Label>
                      {isEditing ? (
                        <Input
                          value={editedClient.company_registration_number || ''}
                          onChange={(e) => setEditedClient({ ...editedClient, company_registration_number: e.target.value })}
                        />
                      ) : (
                        <Input value={client.company_registration_number || ''} disabled />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Communication History
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Communication
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Type</Label>
                        <Select value={newCommunication.type} onValueChange={(value: 'email' | 'phone' | 'whatsapp' | 'meeting' | 'document') => 
                          setNewCommunication({ ...newCommunication, type: value })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                              </div>
                            </SelectItem>
                            <SelectItem value="phone">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone Call
                              </div>
                            </SelectItem>
                            <SelectItem value="whatsapp">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                WhatsApp
                              </div>
                            </SelectItem>
                            <SelectItem value="meeting">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Meeting
                              </div>
                            </SelectItem>
                            <SelectItem value="document">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Document
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={newCommunication.subject}
                          onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                          placeholder="Communication subject"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Message</Label>
                        <Textarea
                          value={newCommunication.message}
                          onChange={(e) => setNewCommunication({ ...newCommunication, message: e.target.value })}
                          placeholder="Communication details"
                          rows={3}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button onClick={handleAddCommunication} className="w-full">
                          Add Communication
                        </Button>
                      </div>
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      No communications recorded yet.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Client Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No documents uploaded yet.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No additional contacts added yet.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
