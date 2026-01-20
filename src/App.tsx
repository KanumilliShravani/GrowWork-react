import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css"; // Required for gridline colors
import "primereact/resources/primereact.min.css";

import { PrimeReactProvider } from "primereact/api";

import { DataTable,type DataTableStateEvent} from 'primereact/datatable';
import { Button } from "primereact/button";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Column } from 'primereact/column';
import { InputNumber,type InputNumberValueChangeEvent } from "primereact/inputnumber";
import './App.css'
import { useEffect, useState,useRef} from 'react';

function App() {
   const [response,setResponse] = useState<Artwork[]>([])
   const [apiData,setAPiData] = useState<ArticResponse | null>(null)
   const [totalRecords,setTotal] = useState<number>(0)
   const [first,setFirst] = useState<number>(1)
   const [rows,setRows] = useState<number>(0)
   const [selectedArtWorks,setSelected] = useState<Artwork[]>([])
   const [numValue,setValue] = useState<number>(0)
   const op = useRef<OverlayPanel>(null);
 const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());;
  

   interface Artwork{
    id: number;
    title: string;
    place_of_origin:string;
    artist_display:string;
    inscriptions: null | string ;
    start_date : number;
    end_date: number;
   }

    interface ArticResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    total_pages: number;
    current_page: number;
  };
}

 const currentPage = (first / rows) + 1;

   useEffect(() => {
    const controller = new AbortController();
    async function fetchData(){
       try{
          const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`, {
          signal: controller.signal
        });
        if(res.ok){
          const data = (await res.json()) as ArticResponse
          console.log(data)
          setAPiData(data)
          setTotal(data.pagination.total_pages)
          setRows(data.pagination.limit)
          setResponse(data.data)
        }
        else {
          console.error(`Error: HTTP status ${res.status}`);
        }

       }catch(err){
         if (err instanceof Error && err.name !== 'AbortError') {
          console.error("Fetch error:", err.message);
        }
       }

    }
    fetchData()
      return () => controller.abort();
   },[currentPage])

const goToSpecificPage = (pageNumber: number) => {
 
    const newFirst = (pageNumber - 1) * rows;
    setFirst(newFirst);
};
 const onPageChange = (event: DataTableStateEvent) => {
        setFirst(event.first);
    };
      const headerTemplate = () => {
      
        return (
            <div className="flex align-items-center gap-2">
              
                <Button 
                    type="button" 
                    icon="pi pi-chevron-down" 
                    className="p-button-text p-0" 
                      style={{ width: '20px', height: '20px',color: 'grey'}}
                    onClick={(e) => op.current?.toggle(e)} 
                />
            </div>
        );
    };

        const onSelectionChange = (e : any) => {
     
       const selected = e.value as any[];

    setSelected(selected);

    setSelectedRowIds(prev => {
        const updated = new Set(prev);

        // Add selected IDs on this page
        response.forEach((row,idx )=> {
              const globalIndex = first + idx;
            if (selected.some(r => r.id === row.id)) updated.add(globalIndex);
            else updated.delete(globalIndex);
        });

        return updated;
    });
    };

    const applyManualSelection = () => {

 setSelectedRowIds(prev => {
        const updated = new Set(prev);
        for (let i = first; i <= Math.min(numValue,totalRecords); i++) {
            updated.add(i);
        }
        return updated;
    });
  
    op.current?.hide();
       
    }
 useEffect(() => {
    const currentSelection = response.filter((row, idx) => 
        selectedRowIds.has(first + idx) 
    );
    setSelected(currentSelection);
}, [response, selectedRowIds, first]);

console.log('IDs:', [...selectedRowIds]);
const pageLeft = <Button label="Go to Page 2" onClick={() => goToSpecificPage(2)} />

  return (
    <PrimeReactProvider value={{ unstyled: false }}>
    <>
    <p className="selected-rows">Selected: {selectedRowIds.size} Rows</p>
    <OverlayPanel ref={op} appendTo="self"> 
      <div className='overlay-panel'>
      <p>Select Multiple Rows.</p>
      <label htmlFor='inputNumber'>Enter number of rows to select across all pages.</label>
       <div className='input-box flex-auto' style={{ padding: '10px', minWidth: '200px' }}>
      <InputNumber id="inputNumber" placeholder='e.g; 20' value={numValue} style={{ width: '100%' }}  incrementButtonIcon="pi pi-chevron-up" 
    decrementButtonIcon="pi pi-chevron-down"  showButtons 
     buttonLayout="stacked" min={0} max={totalRecords} onValueChange={(e: InputNumberValueChangeEvent) => setValue(e.value?? 0)} />
    <Button type="button" className='select-btn' label="Select" onClick={applyManualSelection}/>
   </div>
    </div>
    </OverlayPanel>
    <DataTable selectionMode="multiple" 
    value={apiData?.data || []}
    paginator rows={rows}
    totalRecords={totalRecords}
    first={first}
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    currentPageReportTemplate="{first} to {last} of {totalRecords}"
    pt = {{
      paginator:{
         root: { 
                className: 'flex justify-content-between align-items-center' 
            },
              current: {
                className: 'mr-0'
            },
      }
    }}
    
     lazy
     onPage={onPageChange}
     stripedRows
     paginatorLeft={pageLeft}
     
     selection= {selectedArtWorks}
    onSelectionChange={onSelectionChange} 
     dataKey="id" showGridlines tableStyle={{ minWidth: '50rem' }}>

        <Column selectionMode="multiple" header={headerTemplate} headerStyle={{ width: '6rem',textAlign:'center' }}  ></Column>
        <Column field="title" header="TITLE"></Column>
        <Column field="place_of_origin" header="PLACE OF ORIGIN"></Column>
        <Column field="artist_display" header="ARTIST"></Column>
        <Column field="inscriptions" header="INSCRIPTIONS"></Column>
        <Column field="date_start" header="START DATE"></Column>
        <Column field="date_end" header="END DATE"></Column>
        
    </DataTable>
    </>
    </PrimeReactProvider>
  )
}

export default App
