
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Building, Calendar, Save, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentLabel } from '@/lib/constants/departments';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil oppdatert',
        description: 'Din profil har blitt oppdatert.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere profilen.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Min Profil</h1>
            <p className="text-gray-600">Laster brukerinformasjon...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-myhrvold-primary" />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Min Profil</h1>
            <p className="text-gray-600">Administrer din profil og innstillinger</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profilinformasjon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profilinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ditt navn"
                />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Rediger
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>E-post</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email}</span>
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Kan ikke endres
                </Badge>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Lagrer...' : 'Lagre'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                  }}
                >
                  Avbryt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rolle og tillatelser */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rolle og tillatelser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Badge variant="default" className="text-sm">
                {roleLabels[user.user_role]}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Avdeling</Label>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getDepartmentLabel(user.department)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Systemtilgang</Label>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Dashboard</span>
                  <Badge variant="outline" className="text-xs">Aktivert</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Reklamasjoner</span>
                  <Badge variant="outline" className="text-xs">Aktivert</Badge>
                </div>
                {user.user_role === 'admin' && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Brukeradministrasjon</span>
                    <Badge variant="outline" className="text-xs">Aktivert</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontoinformasjon */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Kontoinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Opprettet</Label>
                <span className="text-sm text-gray-600">
                  {new Date(user.id).toLocaleDateString('nb-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {user.seller_no && (
                <div className="space-y-2">
                  <Label>Selger Nr.</Label>
                  <span className="text-sm text-gray-600">{user.seller_no}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
