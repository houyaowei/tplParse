# tplParse
###支持四种语法
1.条件判断
<pre>
   {if condition}
    // code
   {else if condition}
    // code
   {else}
    // code
   {/if}
</pre>
2.数组遍历
<pre>
{list array as item}
  // code
{/list}
</pre>
3.定义变量
<pre>
{var name = 'hyw'}
</pre>
4.表达式
<pre>
${var1} 
// 使用过滤器插值的方式
${var1|filter1|filter2:var2, var3}
</pre>