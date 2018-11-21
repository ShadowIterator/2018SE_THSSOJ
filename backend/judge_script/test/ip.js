(() => {
  var input = ['255.255.255.0', '123.124.123.2', '59.66.137.30'];
  var expected_output = ['59.66.137.30', '123.124.123.2', '255.255.255.0']

  assert.deepStrictEqual(ip_sort(input), expected_output)
})()