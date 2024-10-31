import type { ReactNode, Dispatch, SetStateAction } from "react";
import {
  createContext,
  useContext,
  useState,
  // memo
} from "react";

import { Box } from "./Box";
import { ButtonBase } from "./ButtonBase";
import { Stack } from "./Stack";

// moreso making this component as an educational exercise, not that I anticipate needing to create a lot of UI with tabs

/* 
  nice to have with TabsRoot, Tab, and TabContent would be to ensure that
  the value passed into Tab and TabContent, and initTabValue passed into
  TabsRoot was constrained by typescript somehow so that I can specify a string
  union and ensure that the value/initTabValue props only ever are passed values from that
  union, otherwise get a type error 
*/

const TabContext = createContext<{
  tabValue: string;
  setTabValue: Dispatch<SetStateAction<string>>;
}>({
  tabValue: "",
  setTabValue: () => {},
});

const useTabsContext = () => useContext(TabContext);

interface TabsRootProps {
  children: ReactNode;
  initTabValue: string;
}

export function TabsRoot({ initTabValue, children }: TabsRootProps) {
  const [tabValue, setTabValue] = useState(initTabValue);
  return (
    <TabContext.Provider value={{ tabValue, setTabValue }}>
      {children}
    </TabContext.Provider>
  );
}

// type TabContainerProps = TabsProps;

// do I need this component? I only created it to be able to wrap the
// component directly under a context provider with React.memo
// function BaseTabContainer({ children }: TabContainerProps) {
//   // dispatch functions should have a stable reference, so no need to memoize setter
//   const [tabIndex, setTabIndex] = useState(0);

//   return (
//     <>
//       <TabContext.Provider value={{ tabIndex, setTabIndex }}>
//         {children}
//       </TabContext.Provider>
//     </>
//   );
// }

// export const TabContainer = memo(BaseTabContainer);

interface TabProps {
  label: string;
  value: string;
  className?: string;
}

export function Tab({ label, value, className }: TabProps) {
  const { setTabValue } = useTabsContext();

  function assignAsCurrentTab() {
    setTabValue(value);
  }

  return (
    <ButtonBase onClick={assignAsCurrentTab} className={` ${className ?? ""}`}>
      {label}
    </ButtonBase>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  const { tabValue } = useTabsContext();

  if (value !== tabValue) return null;

  return <Box className={` ${className ?? ""}`}>{children}</Box>;
}

// what if I leave rendering the tabs to the parent of TestTabs?
// so it looks like:
// <TestTabs>
//  [1, 2, 3].map(val => {
//    return <Tab>{val}</Tab>
//  })
//  [1, 2, 3].map(val => {
//    return <TabPanel>{val}</TabPanel>
//  })
// </TestTabs>

// actually, what if I just don't map, and just render the Tabs and TabContent compoonents individually
// since I doubt there will be many cases where I need to map over and create tabs
// versus just having handful of panels that I want to render
// having to map like above example would be pretty awkward if I wanted to render different components for each mapped
// over TabPanel. I would have to do something like conditionally return the children I want in a TabPanel based on the
// items being mapped over, and probably finagle typescript to pass in the correct type. Doesn't seem worth it at the moment
// with how I think I'll use tabs. See below example for cleaner looking API I want to go for

/* 
  TestTabs would return jsx looking roughly like this:

  <TabsRoot initVal={1}>
    <Tab>Title 1</Tab>
    <Tab>Title 2</Tab>
    <TabContent>tab 1 stuff</TabContent>
    <TabContent>tab 2 stuff</TabContent>
  </TabsRoot>; 
*/

export function TestTabs() {
  return (
    <Box className="border-solid border-2 border-gray-600">
      {/* 
        nice to have with TabsRoot, Tab, and TabContent would be to ensure that
        the value passed into Tab and TabContent, and initTabValue passed into
        TabsRoot was constrained by typescript somehow so that I can specify a string
        union and ensure that the value/initTabValue props only ever are passed values from that
        union, otherwise get a type error 
      */}
      <TabsRoot initTabValue="recipes">
        <Box className="bg-amber-300 p-1 gap-3 flex">
          <Stack className="p-1 bg-slate-300 flex-1">
            <Tab label="Recipes" value="recipes" />
          </Stack>
          <Stack className="p-1 bg-slate-300 flex-1">
            <Tab label="Meals" value="meals" />
          </Stack>
        </Box>
        <TabContent value="recipes">
          <RecipeList />
        </TabContent>
        <TabContent value="meals">
          <MealsList />
        </TabContent>
      </TabsRoot>
    </Box>
  );
}

function RecipeList() {
  return <Stack>Hello recipes written</Stack>;
}

function MealsList() {
  return <Stack>Hello meals cooked</Stack>;
}
