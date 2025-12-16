import * as React from 'react';

import { Head } from '../seo';

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
};

export const ContentLayout = ({ children, title }: ContentLayoutProps) => {
  return (
    <>
      <Head title={title} />
      {/* full viewport height and column layout */}
      <div className="min-h-screen flex flex-col">
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
          {/* main area: flex-col and will expand to remaining height */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 flex-1 w-full flex flex-col items-center">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
