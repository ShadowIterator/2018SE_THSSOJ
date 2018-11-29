(() => {
  const tree = {
      val: 1,
      right: {
          val: 2,
          right: null,
          left: {
              val: 3,
              right: null,
              left: null
          }
      },
      left: null
  };
  const iterator = new TreeIterator(tree);
  let result = [];
  while(iterator.has_next()){
      result.push(iterator.next_value());
  }
  assert.deepStrictEqual(
      result, [1, 3, 2]
  );
})();
