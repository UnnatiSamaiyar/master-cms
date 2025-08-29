"use client";
import { DOTS, usePagination } from "@/hooks/usePagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PaginationComponent = ({ totalResults }: { totalResults: number }) => {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const searchParams = useSearchParams();
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const pathname = usePathname();
  const { replace } = useRouter();
  const pageCount = Math.ceil(totalResults / rowPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalPageCount: pageCount,
  });

  if (currentPage === 0 || (paginationRange && paginationRange.length < 1)) {
    return null;
  }

  React.useEffect(() => {
    const perPage = searchParams.get("perRow");
    if (perPage) setRowPerPage(Number(perPage));
    const current_page = searchParams.get("page");
    if (current_page) setCurrentPage(Number(current_page));
  }, [searchParams]);

  const numberOfPages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const updatePage = (page: number | null) => {
    const params = new URLSearchParams(searchParams as any);
    if (page) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination className="items-center">
      <p className="pr-2 font-bold text-sm">
        Page {currentPage} of {pageCount}
      </p>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isDisable={currentPage === 1}
            onClick={() => updatePage(currentPage - 1)}
            isActive={currentPage === 1}
          />
        </PaginationItem>
        {paginationRange &&
          paginationRange.map((page) => {
            if (page === DOTS) {
              return <PaginationEllipsis key={page as string} />;
            }
            return (
              <PaginationItem key={page as number}>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => updatePage(page as number)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        <PaginationItem>
          <PaginationNext
            isDisable={numberOfPages.length === currentPage}
            className="cursor-pointer"
            onClick={() => updatePage(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
