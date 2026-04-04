import { FormularioTransaccion } from './FormularioTransaccion';

interface Props {
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => void;
}

export const FormularioGasto = ({ onAgregar }: Props) => {
  return <FormularioTransaccion tipo="gasto" onAgregar={onAgregar} />;
};
