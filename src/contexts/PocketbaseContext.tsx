import React, { createContext, useContext, useState, useEffect } from 'react';
import Pocketbase from 'pocketbase';
import { Item } from '../models/Items';

interface PocketbaseContextProps {
  myPocketbase: Pocketbase;
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
  const [subscription, setSubscription] = useState<any>(null);
  const [myPocketbase] = useState(
    new Pocketbase("http://127.0.0.1:8090")
  );
  // const authData =  pocketbase.collection('users').authWithPassword("sarthakshah44993@gmail.com", "Admin@123");
  const fetchItems = async () => {
    try {
      const authAdminData = myPocketbase.admins.authWithPassword('sarthakshah44993@gmail.com', 'superAdmin@123');
   
      const newSubscription = myPocketbase.collection('items').subscribe(
        '*', // empty string as the query
        (change: any) => {
          console.log("change outside", change);
          
          // Handle the change and update state accordingly
          if (change.action === "create" || change.action === 'update' || change.action === 'delete') {
            fetchItems(); // Update the items state
            console.log("change",change);
            
          }
        }
      );
        console.log("new subscription",newSubscription);
        
      setSubscription(newSubscription);
      const records = await myPocketbase.collection('items').getFullList({
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
    const newData = await myPocketbase.collection('items').create(data).then((res) => {
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
    const newData = await myPocketbase.collection('items').update(itemId, data).then((res) => {
      setTimeout(() => {
        
        fetchItems()
      }, 1500);
    })
    return newData

  }

  const deleteItem = async (itemId:string ) => {
   
    const newData = await myPocketbase.collection('items').delete(itemId).then((res) => {
      setTimeout(() => {
        
        fetchItems()
      }, 1500);
    })
    return newData

  }
  useEffect(() => {
    fetchItems();
   
    return () => {
      // Unsubscribe when the component is unmounted
      if (subscription) {
        subscription.unsubscribe();
        console.log("subscription on unmount", subscription);
        
      }
    };
  }, [myPocketbase]);

  const contextValue: PocketbaseContextProps = {
    myPocketbase,
    items,
    fetchItems,
    addItem,
    editItem,
    deleteItem
  };

  return <PocketbaseContext.Provider value={contextValue}>{children}</PocketbaseContext.Provider>;
};

export default PocketbaseProvider;
