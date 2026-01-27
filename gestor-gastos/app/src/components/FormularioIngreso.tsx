import { FormularioTransaccion } from './FormularioTransaccion';

interface Props {
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string) => void;
}

export const FormularioIngreso = ({ onAgregar }: Props) => {
  return <FormularioTransaccion tipo="ingreso" onAgregar={onAgregar} />;
};
