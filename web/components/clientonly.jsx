import dynamic from 'next/dynamic';


const ClientOnlyInner = (props) => {
  const { children } = props;
  return children;
};


export const ClientOnly = dynamic(() => Promise.resolve(ClientOnlyInner), {
  ssr: false,
});


export default ClientOnly;
