import React, { createContext, useContext, useState, useEffect } from 'react';
import Pocketbase from 'pocketbase';
import { Item } from '../models/Items';

interface PocketbaseContextProps {
  pocketbase: Pocketbase;
  items: Item[];
  fetchItems: () => Promise<void>;
  addItem: (itemName: string) => Promise<void>;
  editItem: (itemId:string, itemName: string) => Promise<void>;
  deleteItem: (itemId:string) => Promise<void>;
}
interface PocketbaseProviderProps {
  children: React.ReactNode; // Ensure it accepts children prop
}


const PocketbaseContext = createContext<PocketbaseContextProps | undefined>(undefined);

export const usePocketbase = () => {
  const context = useContext(PocketbaseContext);
  if (!context) {
    throw new Error('usePocketbase must be used within a PocketbaseProvider');
  }
  return context;
};

export const PocketbaseProvider: React.FC<PocketbaseProviderProps> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [pocketbase] = useState(
    new Pocketbase("http://127.0.0.1:8090")
  );
  // const authData =  pocketbase.collection('users').authWithPassword("sarthakshah44993@gmail.com", "Admin@123");
  const fetchItems = async () => {
    try {
      const authAdminData = pocketbase.admins.authWithPassword('sarthakshah44993@gmail.com', 'superAdmin@123');
      pocketbase.collection('items').subscribe('*', function (e:any) {
        console.log("action",e.action);
        console.log("record",e.record);
    }, { /* other options like expand, custom headers, etc. */ });
      const records = await pocketbase.collection('items').getFullList({
        sort: '-created',
      });

      setItems(records);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addItem = async (itemName: String) => {
    const data = {
      "name": itemName
    };
    const newData = await pocketbase.collection('items').create(data).then((res) => {
      setTimeout(() => {
        
        fetchItems()
      }, 1500);
    })
    return newData

  }
  const editItem = async (itemId:string ,itemName: String) => {
    const data = {
      "name": itemName
    };
    const newData = await pocketbase.collection('items').update(itemId, data).then((res) => {
      setTimeout(() => {
        
        fetchItems()
      }, 1500);
    })
    return newData

  }

  const deleteItem = async (itemId:string ) => {
   
    const newData = await pocketbase.collection('items').delete(itemId).then((res) => {
      setTimeout(() => {
        
        fetchItems()
      }, 1500);
    })
    return newData

  }
  useEffect(() => {
    fetchItems();
  }, []);

  const contextValue: PocketbaseContextProps = {
    pocketbase,
    items,
    fetchItems,
    addItem,
    editItem,
    deleteItem
  };

  return <PocketbaseContext.Provider value={contextValue}>{children}</PocketbaseContext.Provider>;
};

export default PocketbaseProvider;
