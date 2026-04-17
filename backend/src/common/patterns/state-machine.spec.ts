import { StateMachine } from './state-machine';

describe('StateMachine', () => {
  // Order state machine — dung cho don hang
  const orderMachine = new StateMachine<number>({
    labels: {
      0: 'Cho xac nhan',
      1: 'Da xac nhan',
      2: 'Dang dong goi',
      3: 'Dang giao',
      4: 'Hoan thanh',
      5: 'Da huy',
      6: 'Doi tra',
    },
    transitions: [
      { from: 0, to: 1 }, { from: 0, to: 5 },
      { from: 1, to: 2 }, { from: 1, to: 5 },
      { from: 2, to: 3 }, { from: 2, to: 5 },
      { from: 3, to: 4 }, { from: 3, to: 6 },
      { from: 4, to: 6 },
    ],
  });

  describe('canTransition', () => {
    it.each([
      [0, 1, true],
      [0, 5, true],
      [1, 2, true],
      [1, 5, true],
      [2, 3, true],
      [2, 5, true],
      [3, 4, true],
      [3, 6, true],
      [4, 6, true],
    ])('canTransition(%i, %i) = %s', (from, to, expected) => {
      expect(orderMachine.canTransition(from, to)).toBe(expected);
    });

    it.each([
      [0, 2], [0, 3], [0, 4], [0, 6],
      [1, 0], [1, 3], [1, 4],
      [2, 0], [2, 1], [2, 4],
      [3, 0], [3, 1], [3, 2], [3, 5],
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
      [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 6],
      [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    ])('canTransition(%i, %i) = false', (from, to) => {
      expect(orderMachine.canTransition(from, to)).toBe(false);
    });
  });

  describe('getAvailableTransitions', () => {
    it('Pending(0) co the chuyen sang [1, 5]', () => {
      expect(orderMachine.getAvailableTransitions(0)).toEqual([1, 5]);
    });

    it('Completed(4) chi co the chuyen sang [6]', () => {
      expect(orderMachine.getAvailableTransitions(4)).toEqual([6]);
    });

    it('Cancelled(5) khong co transition nao', () => {
      expect(orderMachine.getAvailableTransitions(5)).toEqual([]);
    });

    it('Return(6) khong co transition nao', () => {
      expect(orderMachine.getAvailableTransitions(6)).toEqual([]);
    });
  });

  describe('transition', () => {
    it('thuc hien transition hop le khong throw', async () => {
      await expect(orderMachine.transition(0, 1)).resolves.toBeUndefined();
    });

    it('throw Error khi transition khong hop le', async () => {
      await expect(orderMachine.transition(0, 4)).rejects.toThrow(
        'Không thể chuyển từ "Cho xac nhan" sang "Hoan thanh"',
      );
    });

    it('chay onTransition callback khi co', async () => {
      const callback = jest.fn();
      const machine = new StateMachine<number>({
        transitions: [{ from: 0, to: 1, onTransition: callback }],
      });

      await machine.transition(0, 1, { orderId: '123' });

      expect(callback).toHaveBeenCalledWith({ orderId: '123' });
    });
  });

  describe('getLabel', () => {
    it('tra ve label dung', () => {
      expect(orderMachine.getLabel(0)).toBe('Cho xac nhan');
      expect(orderMachine.getLabel(4)).toBe('Hoan thanh');
    });

    it('tra ve string cua state khi khong co label', () => {
      const machine = new StateMachine<number>({
        transitions: [{ from: 0, to: 1 }],
      });
      expect(machine.getLabel(0)).toBe('0');
    });
  });
});
