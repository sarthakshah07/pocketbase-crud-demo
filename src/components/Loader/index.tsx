import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

interface ILoaderProps {
    handleLoaderClose : any,
    loaderOpen: boolean
}
export default function Loader(props: ILoaderProps) {
    const {handleLoaderClose,loaderOpen} = props
  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loaderOpen}
        onClick={handleLoaderClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}