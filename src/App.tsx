import "primereact/resources/themes/lara-light-cyan/theme.css"; // Required for gridline colors
import "primereact/resources/primereact.min.css";

import { DataTable,type DataTableStateEvent} from 'primereact/datatable';
import { Button } from "primereact/button";
import { Column } from 'primereact/column';
import './App.css'
import { useEffect, useState } from 'react';

function App() {
   const [response,setResponse] = useState<Artwork[]>([])
   const [apiData,setAPiData] = useState<ArticResponse | null>(null)
   const [totalRecords,setTotal] = useState<number>(0)
   const [first,setFirst] = useState<number>(0)
   const [rows,setRows] = useState<number>(0)
   const [selectedArtWorks,setSelected] = useState<Artwork[]>([])

    

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


const pageLeft = <Button label="Go to Page 2" onClick={() => goToSpecificPage(2)} />

  return (
    <>
    <p className="selected-rows">Selected Rows: {selectedArtWorks.length}</p>
    <DataTable selectionMode="multiple" 
    value={response}
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
                className: 'mr-0' // Optional styling for the report text
            },
      }
    }}
     lazy
     onPage={onPageChange}
     paginatorLeft={pageLeft}
     selection={selectedArtWorks} onSelectionChange={(e) => setSelected(e.value as unknown as Artwork[])} dataKey="id" showGridlines tableStyle={{ minWidth: '50rem' }}>
        <Column selectionMode="multiple"></Column>
        <Column field="title" header="TITLE"></Column>
        <Column field="place_of_origin" header="PLACE OF ORIGIN"></Column>
        <Column field="artist_display" header="ARTIST"></Column>
        <Column field="inscriptions" header="INSCRIPTIONS"></Column>
        <Column field="date_start" header="START DATE"></Column>
        <Column field="date_end" header="END DATE"></Column>
        
    </DataTable>
    </>
  )
}

export default App
