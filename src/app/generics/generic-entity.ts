import { MessageService } from "primeng/api";
import { ROWS_PER_PAGE_OPTIONS } from "../constants/pagination.constant";
import { DropdownDTO } from "../dto/dropdown.dto";
import { DateFormatting } from "../helpers/date-formatting";
import { Sorting, SortingRuleFormat } from "../helpers/sorting";

export class GenericEntityComponent {
    
    /* common pagination variables */
    protected totalRecords: number;
    protected numberOfRowsPerPageOptions: {rows: number}[] = ROWS_PER_PAGE_OPTIONS;
    protected numberOfRowsPerPage: number = 10;

    /* server side pagination variables */
    protected skip: number;
    protected take: number;

    /* server side filtering variables */
    protected displayCalendar: boolean = false;
    protected startDateFilterInput: string = null;
    protected endDateFilterInput: string = DateFormatting.dateStringToUTC(new Date());
    protected dateRange: {start: string, end: string} = null;

    /* server side sorting variables */
    protected orderBy: string = null;
    protected order: 'asc' | 'desc' = 'asc';

    /* errors */
    protected error: string;

    constructor(
      protected messageService: MessageService
    ){}

    protected preSort<T>(data: T[], rules: SortingRuleFormat[]): T[] {
        return Sorting.dataSorting(data, rules);
      }

    protected setPagination(tableElement): void {
      if(!tableElement) {
        this.skip = 0;
        this.take = this.numberOfRowsPerPage;
      }
      else {
        this.skip = tableElement._first;
        this.take = tableElement._rows;
      }
    }

    protected showSuccess(message: string): void {
      this.messageService.add({severity:'success', summary: 'Success', detail: message});
    }
  
    protected showError(message: string) {
      this.messageService.add({severity:'error', summary: 'Error', detail: message});
    }
}

export class GET_CONFIGURATION_DTO {
  isLazy ?: boolean;
}