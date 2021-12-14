<script>
//object geeks1
var geeks1 = {
name : "ABC",
article: "C++"
}
//object geeks2
  var geeks2 = {
name : "CDE",
article: "JAVA"
}
    
  //object geeks3
  var geeks3 = {
name : "IJK",
article: "C#"
}
  
function printVal(){
   document.write(this.name+" contributes about "+this.article+"<br>");
   }
        
  var printFunc2= printVal.bind(geeks1);
   //using bind() 
   // bind() takes the object "geeks1" as parameter//
  printFunc2();
    
  var printFunc3= printVal.bind(geeks2);
  printFunc3();
    
  var printFunc4= printVal.bind(geeks3);
  printFunc4();
  //uniquely defines each objects
</script>
//Output:

//ABC contributes about C++
//CDE contributes about JAVA
//IJK contributes about C#