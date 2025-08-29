"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React from "react";

export default function PerRowSelect() {
  const perRowArr: number[] = [10, 20, 30, 40, 50];
  const [perRow, setPerRow] = React.useState<number>(perRowArr[0] as number);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  React.useEffect(() => {
    const perPage = searchParams.get("perRow");
    if (perPage) setPerRow(Number(perPage));
  }, [searchParams]);

  const handleSelect = (PerRow: string) => {
    const params = new URLSearchParams(searchParams);
    PerRow ? params.set("perRow", PerRow) : params.delete("perRow");
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSelect} value={perRow.toString()}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Row per page" />
      </SelectTrigger>
      <SelectContent>
        {perRowArr.map((item) => (
          <SelectItem key={item} value={item.toString()}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
