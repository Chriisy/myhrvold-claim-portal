
import React, { Suspense, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { FGasHeaderActions } from '@/components/certificates/FGasHeaderActions';

// Lazy load components with correct import syntax for named exports
const CertificateStats = React.lazy(() => import('@/components/certificates/CertificateStats').then(module => ({ default: module.CertificateStats })));
const ExpiringCertificatesAlert = React.lazy(() => import('@/components/certificates/ExpiringCertificatesAlert').then(module => ({ default: module.ExpiringCertificatesAlert })));
const CertificatesList = React.lazy(() => import('@/components/certificates/CertificatesList').then(module => ({ default: module.CertificatesList })));
const InternalControlSection = React.lazy(() => import('@/components/certificates/InternalControlSection').then(module => ({ default: module.InternalControlSection })));

const FGasCertificates = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">F-gass Sertifikater</h1>
            <p className="text-gray-600">Administrer F-gass sertifikater og internkontroll</p>
          </div>
        </div>
        <FGasHeaderActions />
      </div>

      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certificates">Sertifikater</TabsTrigger>
          <TabsTrigger value="internkontroll">Internkontroll</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          <OptimizedErrorBoundary>
            <Suspense fallback={<div className="h-4" />}>
              <ExpiringCertificatesAlert />
            </Suspense>
          </OptimizedErrorBoundary>

          <OptimizedErrorBoundary>
            <Suspense fallback={<OptimizedLoadingStates.Cards />}>
              <CertificateStats />
            </Suspense>
          </OptimizedErrorBoundary>

          <OptimizedErrorBoundary>
            <Suspense fallback={<OptimizedLoadingStates.Table />}>
              <CertificatesList filterType="all" />
            </Suspense>
          </OptimizedErrorBoundary>
        </TabsContent>

        <TabsContent value="internkontroll">
          <OptimizedErrorBoundary>
            <Suspense fallback={<OptimizedLoadingStates.Table />}>
              <InternalControlSection />
            </Suspense>
          </OptimizedErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FGasCertificates;
