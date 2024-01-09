import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, Dialog, DialogTitle, TextField } from '@mui/material';
import { usePocketbase } from '../../contexts/PocketbaseContext'; // Import the Pocketbase context
import { Item } from '../../models/Items';
import Loader from '../Loader';
import Swal from 'sweetalert2';

interface DialogProps {
    activeRow :any
}

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  })

const ItemList: React.FC = () => {
  const { items, fetchItems,addItem, editItem,deleteItem } = usePocketbase(); // Fetch items from Pocketbase
const [openAddDialog,setOpenAddDialog] = useState(false)
const [isEdit,setIsEdit] = useState(false)
const [itemName,setItemName] = useState<any>(null)
const [activeRow,setActiveRow] = useState<any>(null)
const [loaderOpen, setLoaderOpen] = React.useState(false);


const handleLoaderClose = () => {
  setLoaderOpen(false);
};
const handleLoaderOpen = () => {
  setLoaderOpen(true);
};

const handleClose=()=>{
    setActiveRow(null)
    setItemName(null)
    setOpenAddDialog(false)
}

const handleAddItem =()=>{
    handleLoaderOpen()
    setOpenAddDialog(false)
    setItemName(null)
    if (isEdit) {
        editItem(activeRow?.id,itemName).then((response :any)=>{
            setTimeout(() => {
                Toast.fire({
                    icon: 'success',
                    title: 'Item Edited Successfully',
                  })
                  handleClose()
                  setItemName(null)
                handleLoaderClose()
            }, 1500);
        }).catch((error)=>{
            setTimeout(() => {
                Toast.fire({
                    icon: 'error',
                    title: 'Item Not Edited',
                  })
                  
                handleLoaderClose()
            }, 1500);
        })
    }else {
    addItem(itemName).then((response :any)=>{
        setTimeout(() => {
            Toast.fire({
                icon: 'success',
                title: 'Item Added Successfully',
              })
              handleClose()
            handleLoaderClose()
        }, 1500);
    }).catch((error)=>{
        setTimeout(() => {
            Toast.fire({
                icon: 'error',
                title: 'Item Not Added',
              })
            handleLoaderClose()
        }, 1500);
    })
}
}
const AddDialog =(props:DialogProps)=>{
    const {activeRow} =props
    useEffect(()=>{
        if (activeRow) {
            setIsEdit(true)
        }
    },[activeRow])
console.log("active row", activeRow);

    return(
        <Dialog onClose={handleClose} open={openAddDialog} sx={{padding:"30px !important"}}>
        <DialogTitle align='center'> {isEdit ? "Edit" : "Add"} Item</DialogTitle>
        <TextField  
        label="Item Name"
        name='name'
        value={itemName || activeRow?.name }
        onChange={(e)=>setItemName(e.target.value)}
        sx={{margin:2}}/>
       <div style={{margin:8 , display:"flex" , justifyContent:"space-between"}}>
       <Button variant='contained' color='success' onClick={handleAddItem}>Submit</Button>
       <Button variant='contained' color='inherit' onClick={()=>handleClose()}>Back</Button>
       </div>

      </Dialog>
    )
}
  // Function to handle delete of an item
  const handleDelete = async (id: any) => {
    Swal.fire({
        title: "Are you sure?",
        text: "Want to Delete this this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
            handleLoaderOpen()
            setOpenAddDialog(false)
            setActiveRow(null)
            setIsEdit(false)
            await deleteItem(id).then((response :any)=>{
                setTimeout(() => {
                    Toast.fire({
                        icon: 'success',
                        title: 'Item Deleted Successfully',
                      })
                      handleClose()

                    handleLoaderClose()
                }, 1500);
            }).catch((error)=>{
                setTimeout(() => {
                    Toast.fire({
                        icon: 'error',
                        title: 'Item Not Deleted',
                      })
                      
                    handleLoaderClose()
                }, 1500);
            })
       
        }
      });
   
    // Implement Pocketbase delete operation using the id
    // Example: await pocketbase.delete('items', id);
    // After deletion, fetch updated items using fetchItems()
  };
  const handleEdit =(item:any)=>{
    setActiveRow(item)
  }

  
  useEffect(()=>{
    if (activeRow) {
        setOpenAddDialog(true)
    }
  },[activeRow])

  return (
    <div >
      <Typography variant="h4" gutterBottom>
        Item List
      </Typography>
      <Box  display={"flex"} justifyContent={"end"} m={2}> 
        <Button variant='contained' onClick={()=>setOpenAddDialog(true)}>Add Item</Button>
      </Box>
      <TableContainer component={Table} style={{maxWidth:"100vw !important"}}>
        <Table >
          <TableHead  sx={{backgroundColor:"#1976D2",color:"whitesmoke"}}>
            <TableRow >
              <TableCell sx={{color:"white"}} >Name</TableCell>
              <TableCell sx={{color:"white"}}>Created At</TableCell>
              <TableCell sx={{color:"white"}}>Collection Name</TableCell>
              <TableCell sx={{color:"white"}} colSpan={2} align='center'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: Item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.created}</TableCell>
                <TableCell>{item.collectionName}</TableCell>
                <TableCell align='center' >
                  <Button variant="contained" size='small' color="primary"  sx={{marginRight:{xs:0,sm:2} ,marginBottom:{xs:2,sm:0}}} onClick={()=>handleEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="contained" size='small' color="error"   onClick={() => handleDelete(item?.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      </TableContainer>
      <AddDialog activeRow={activeRow}/>
  <Loader loaderOpen={loaderOpen} handleLoaderClose={handleLoaderClose} />
    </div>
  );
};

export default ItemList;
