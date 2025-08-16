import React from "react";

interface SkeletonPageProps {
  variant?: "grid" | "form" | "metadata";
  showFloatingDock?: boolean;
  showFilters?: boolean;
}

const SkeletonPage: React.FC<SkeletonPageProps> = ({
  variant = "grid",
  showFloatingDock = false,
  showFilters = false,
}) => {
  const renderGridSkeleton = () => (
    <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-14">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className=" rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-24 h-32 bg-black-lighter rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-black-lighter rounded w-3/4"></div>
                <div className="h-4 bg-black-lighter rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-black-lighter rounded w-full"></div>
                  <div className="h-3 bg-black-lighter rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-black-lighter">
              <div className="h-8 bg-black-lighter rounded w-20"></div>
              <div className="h-8 bg-black-lighter rounded w-20"></div>
              <div className="h-8 bg-black-lighter rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-black-lighter rounded"></div>
            <div className="h-6 bg-black-lighter rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <div className="h-4 bg-black-lighter rounded w-24"></div>
                <div className="h-12 bg-black-darker border-2 border-black-light rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMetadataSkeleton = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-black-lighter rounded"></div>
          <div className="h-6 bg-black-lighter rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-black-lighter rounded w-24"></div>
              <div className="h-12 bg-black-darker border-2 border-black-light rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-black-light pt-8 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-black-lighter rounded"></div>
          <div className="h-6 bg-black-lighter rounded w-56"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-black-lighter rounded w-24"></div>
              <div className="h-12 bg-black-darker border-2 border-black-light rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="flex justify-center">
            <div className="h-12 w-24 bg-black-lighter rounded border-2"></div>
          </div>
        </div>
      </div>

      <div className="border-t border-black-light pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-black-lighter rounded"></div>
              <div className="h-6 bg-black-lighter rounded w-48"></div>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-black-lighter rounded w-24"></div>
                  <div className="h-12 bg-black-darker border-2 border-black-light rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-black-lighter rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-black-lighter rounded w-32 mb-3"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex justify-between">
                  <div className="h-3 bg-black-lighter rounded w-16"></div>
                  <div className="h-3 bg-black-lighter rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black-light pt-8 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-black-lighter rounded"></div>
          <div className="h-6 bg-black-lighter rounded w-64"></div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-black-lighter rounded w-32"></div>
              <div className="h-20 bg-black-darker border-2 border-black-light rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-black-light pt-8 animate-pulse">
        <div className="border border-black-lighter rounded-lg p-4">
          <div className="h-4 bg-black-lighter rounded w-32 mb-3"></div>
          <div className="bg-black border border-black-light rounded p-3 h-60">
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, index) => (
                <div
                  key={index}
                  className="h-3 bg-black-lighter rounded w-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${showFloatingDock ? "pb-24" : ""}`}>
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="animate-pulse mb-8">
          <div className="h-9 bg-black-lighter rounded w-64 mx-auto mb-2"></div>
          <div className="h-6 bg-black-lighter rounded w-48 mx-auto mb-6"></div>
        </div>

        {variant !== "metadata" && (
          <>
            {/* Add Button Section */}
            <div className="flex justify-center mb-2 animate-pulse">
              <div className="h-12 bg-black-lighter rounded-lg w-48"></div>
            </div>

            {/* Stats Section */}
            <div className="flex items-center mb-2 animate-pulse">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black-lighter rounded"></div>
                  <div className="h-4 bg-black-lighter rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Search and Filters Section */}
            <div className="mb-8 animate-pulse">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="w-full h-14 bg-black-darker border-2 border-black-lighter rounded-lg"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-14 w-32 bg-black-dark border-2 border-black-lighter rounded-lg"></div>
                  {showFilters && (
                    <div className="h-14 w-28 bg-black-dark border-2 border-black-lighter rounded-lg"></div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content Section */}
        {variant === "grid" && renderGridSkeleton()}
        {variant === "form" && renderFormSkeleton()}
        {variant === "metadata" && renderMetadataSkeleton()}
      </div>

      {/* Floating Dock Skeleton */}
      {showFloatingDock && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-pulse">
          <div className="bg-black-dark border-2 border-black-lighter rounded-full px-3 py-2 shadow-2xl">
            <div className="flex items-center gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="w-11 h-11 bg-black-darker border-2 border-black-lighter rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonPage;
