import { FormularioIngreso } from './FormularioIngreso';
import { ModalBase } from './ModalBase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAgregar: (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => void;
}

export const ModalAgregarIngreso = ({ visible, onClose, onAgregar }: Props) => {
  const handleAgregar = (monto: number, descripcion: string, categoria: string, moneda?: string, nota?: string, fecha?: string, tarjetaId?: string) => {
    onAgregar(monto, descripcion, categoria, moneda, nota, fecha, tarjetaId);
    onClose();
  };

  return (
    <ModalBase
      visible={visible}
      onClose={onClose}
      title="💰 Nuevo Ingreso"
      position="center"
      maxHeight="85%"
    >
      <FormularioIngreso onAgregar={handleAgregar} />
    </ModalBase>
  );
};
