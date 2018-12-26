import random

N = 10
INPRE = 'DATA'
INSUF = 'in'
OUTPRE = 'DATA'
OUTSUF = 'ans'

for i in range(N):
    a = random.randint(0, 5000)
    b = random.randint(0, 5000)    
    with open('''{INPRE}{k}.{INSUF}'''.format(INPRE = INPRE, k = i, INSUF = INSUF), 'w') as fd:
        fd.write('''{a} {b}'''.format(a = a, b = b))
    with open('''{OUTPRE}{k}.{OUTSUF}'''.format(OUTPRE = OUTPRE, k = i, OUTSUF = OUTSUF), 'w') as fd:
        fd.write('''{a_plus_b}'''.format(a_plus_b = a + b))



